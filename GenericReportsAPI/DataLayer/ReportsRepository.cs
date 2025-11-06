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


        public  List<ReportDefinition> GetAllAsync()
        {
            List<ReportDefinition> response = new List<ReportDefinition>();
            try
            {
                using (IDbConnection db = new SqlConnection(_connStr)) 
                {
                    db.Open();
                    response = db.Query<ReportDefinition>("SPECTATOR.RG_ReportDefinitions_GetAll", commandType: CommandType.StoredProcedure).ToList();
                    db.Close();
                }
            }
            catch (Exception ex) 
            {
                throw new Exception("Error to get all reports: " + ex.Message);
            }
            
            return response;
        }

        public ReportDefinition GetByIdAsync(int id)
        {
            ReportDefinition response = new ReportDefinition();
            try
            {
                using (IDbConnection db = new SqlConnection(_connStr))
                {
                    db.Open();
                    response = db.Query<ReportDefinition>("SPECTATOR.RG_ReportDefinitions_GetById", new { Id = id },  commandType: CommandType.StoredProcedure).FirstOrDefault();
                    db.Close();
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error to get all reports: " + ex.Message);
            }

            return response;
        }

        public int CreateAsync(ReportDefinition report)
        {
            int response;
            try
            {
                using (IDbConnection db = new SqlConnection(_connStr))
                {
                    db.Open();
                    response = db.Query<int>("SPECTATOR.RG_ReportDefinitions_Insert", new {
                        Name = report.Name,
                        ConnectionString = report.ConnectionString,
                        StoredProcedure = report.StoredProcedure,
                        Enabled =report.Enabled
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();
                    db.Close();
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error to get all reports: " + ex.Message);
            }
            return response;
        }

        public bool UpdateAsync(ReportDefinition report)
        {
            bool response = false;
            try
            {
                using (IDbConnection db = new SqlConnection(_connStr))
                {
                    db.Open();
                    response = db.Query<bool>("SPECTATOR.RG_ReportDefinitions_Update", new {
                        Id = report.Id,
                        Name = report.Name,
                        ConnectionString = report.ConnectionString,
                        StoredProcedure = report.StoredProcedure,
                        Enabled = report.Enabled
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();
                    db.Close();
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error to get all reports: " + ex.Message);
            }

            return response;
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
