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

        private IDbConnection CreateConnection() => new SqlConnection(_connStr);

        public async Task<IEnumerable<ReportDefinition>> GetAllAsync()
        {
            const string sp = "SPECTATOR.RG_ReportDefinitions_GetAll";
            using var cn = CreateConnection();
            var rows = await cn.QueryAsync<ReportDefinition>(
                sp,
                commandType: CommandType.StoredProcedure
            );
            return rows;
        }

        public async Task<ReportDefinition?> GetByIdAsync(int id)
        {
            const string sp = "SPECTATOR.RG_ReportDefinitions_GetById";
            using var cn = CreateConnection();
            var item = await cn.QuerySingleOrDefaultAsync<ReportDefinition>(
                sp,
                new { Id = id },
                commandType: CommandType.StoredProcedure
            );
            return item;
        }

        public async Task<int> CreateAsync(ReportDefinition report)
        {
            const string sp = "SPECTATOR.RG_ReportDefinitions_Insert";
            using var cn = CreateConnection();
            var newId = await cn.QuerySingleAsync<int>(
                sp,
                new
                {
                    report.Name,
                    report.ConnectionString,
                    report.StoredProcedure,
                    report.Enabled
                },
                commandType: CommandType.StoredProcedure
            );
            return newId;
        }

        public async Task<bool> UpdateAsync(ReportDefinition report)
        {
            const string sp = "SPECTATOR.RG_ReportDefinitions_Update";
            using var cn = CreateConnection();
            var affected = await cn.QuerySingleAsync<int>(
                sp,
                new
                {
                    report.Id,
                    report.Name,
                    report.ConnectionString,
                    report.StoredProcedure,
                    report.Enabled
                },
                commandType: CommandType.StoredProcedure
            );
            return affected > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            const string sp = "SPECTATOR.RG_ReportDefinitions_Delete";
            using var cn = CreateConnection();
            var affected = await cn.QuerySingleAsync<int>(
                sp,
                new { Id = id },
                commandType: CommandType.StoredProcedure
            );
            return affected > 0;
        }
    }
}
