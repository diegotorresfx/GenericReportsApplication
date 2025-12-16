using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;
using BusinessLogic;
using DataObjects;

namespace DataLayer
{
    public sealed class ReportsRepository : IReportsRepository
    {
        private readonly string _connStr;

        public ReportsRepository(ConnectionStrings cs)
        {
            _connStr = !string.IsNullOrWhiteSpace(cs.ProdConnection)
                ? cs.ProdConnection
                : cs.DevConnection;

            if (string.IsNullOrWhiteSpace(_connStr))
                throw new InvalidOperationException("No hay cadena de conexión válida (ProdConnection/DevConnection).");
        }


        public List<ReportDefinition> GetAllAsync()
        {
            using (IDbConnection db = new SqlConnection(_connStr))
            {
                db.Open();

                var reports = db.Query<ReportDefinition>(
                    "SPECTATOR.RG_ReportDefinitions_GetAll",
                    commandType: CommandType.StoredProcedure
                ).ToList();

                foreach (var rep in reports)
                {
                    var parameters = db.Query<ReportParameterDefinition>(
                        "SPECTATOR.RG_ReportParameters_GetByReport",
                        new { ReportDefinitionId = rep.Id },
                        commandType: CommandType.StoredProcedure
                    ).ToList();

                    rep.ParametersDefinition = parameters;
                }

                return reports;
            }
        }


        public ReportDefinition GetByIdAsync(int id)
        {
            ReportDefinition report;
            using (IDbConnection db = new SqlConnection(_connStr))
            {
                db.Open();

                report = db.Query<ReportDefinition>(
                    "SPECTATOR.RG_ReportDefinitions_GetById",
                    new { Id = id },
                    commandType: CommandType.StoredProcedure
                ).FirstOrDefault();

                if (report != null)
                {
                    var parameters = db.Query<ReportParameterDefinition>(
                        "SPECTATOR.RG_ReportParameters_GetByReport",
                        new { ReportDefinitionId = id },
                        commandType: CommandType.StoredProcedure
                    ).ToList();

                    report.ParametersDefinition = parameters;
                }

                db.Close();
            }
            return report;
        }

        public int CreateAsync(ReportDefinition report)
        {
            using (IDbConnection db = new SqlConnection(_connStr))
            {
                db.Open();

                var newId = db.Query<int>(
                    "SPECTATOR.RG_ReportDefinitions_Insert",
                    new
                    {
                        Name = report.Name,
                        ConnectionString = report.ConnectionString,
                        StoredProcedure = report.StoredProcedure,
                        Enabled = report.Enabled
                    },
                    commandType: CommandType.StoredProcedure
                ).First();

                // Insertamos parámetros
                if (report.ParametersDefinition != null)
                {
                    foreach (var p in report.ParametersDefinition)
                    {
                        db.Execute(
                            "SPECTATOR.RG_ReportParameters_Insert",
                            new
                            {
                                ReportDefinitionId = newId,
                                ParamName = p.ParamName,
                                ParamType = p.ParamType,
                                DefaultValue = p.DefaultValue,
                                DisplayOrder = p.DisplayOrder,
                                IsRequired = p.IsRequired
                            },
                            commandType: CommandType.StoredProcedure
                        );
                    }
                }

                return newId;
            }
        }


        public bool UpdateAsync(ReportDefinition report)
        {
            using (IDbConnection db = new SqlConnection(_connStr))
            {
                db.Open();

                var ok = db.Query<bool>(
                    "SPECTATOR.RG_ReportDefinitions_Update",
                    new
                    {
                        Id = report.Id,
                        Name = report.Name,
                        ConnectionString = report.ConnectionString,
                        StoredProcedure = report.StoredProcedure,
                        Enabled = report.Enabled
                    },
                    commandType: CommandType.StoredProcedure
                ).First();

                // REEMPLAZAR parámetros
                db.Execute(
                    "SPECTATOR.RG_ReportParameters_DeleteByReport",
                    new { ReportDefinitionId = report.Id },
                    commandType: CommandType.StoredProcedure
                );

                if (report.ParametersDefinition != null)
                {
                    int order = 0;
                    foreach (var p in report.ParametersDefinition)
                    {
                        db.Execute(
                            "SPECTATOR.RG_ReportParameters_Insert",
                            new
                            {
                                ReportDefinitionId = report.Id,
                                ParamName = p.ParamName,
                                ParamType = p.ParamType,
                                DefaultValue = p.DefaultValue,
                                DisplayOrder = order++,
                                IsRequired = false
                            },
                            commandType: CommandType.StoredProcedure
                        );
                    }
                }

                return ok;
            }
        }


        public bool DeleteAsync(int id)
        {
            bool response = false;
            try
            {
                using (IDbConnection db = new SqlConnection(_connStr))
                {
                    db.Open();
                    response = db.Query<bool>("SPECTATOR.RG_ReportDefinitions_Delete", new { Id = id }, commandType: CommandType.StoredProcedure).FirstOrDefault();
                    db.Close();
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error to get all reports: " + ex.Message);
            }

            return response;
        }
    }
}
