using System.Data;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Dapper;
using BusinessLogic;
using DataObjects;

namespace DataLayer
{
    public sealed class ReportRunner : IReportRunner
    {
        public ReportNameMetadataDto GetMetadata(ExecuteAnyReportRequest request)
        {
            ValidateRequestBasics(request);
            return new ReportNameMetadataDto
            {
                StoredProcedure = request.StoredProcedure,
                ConnectionInfo = MaskConnectionString(request.ConnectionString)
            };
        }

        public ExecuteReportResponse Execute(ExecuteAnyReportRequest request)
        {
            ValidateRequestBasics(request);

            var timeout = request.TimeoutSeconds is > 0 and <= 600 ? request.TimeoutSeconds!.Value : 60;

            using var cn = new SqlConnection(request.ConnectionString);
            cn.Open();

            var dp = ToDynamicParameters(request.Parameters);

            using var grid = cn.QueryMultiple(
                new CommandDefinition(
                    commandText: request.StoredProcedure,
                    parameters: dp,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: timeout));

            var allSets = new List<List<Dictionary<string, object?>>>();

            while (!grid.IsConsumed)
            {
                var rows = grid.Read();
                var set = new List<Dictionary<string, object?>>();
                foreach (var row in rows)
                {
                    var dict = (IDictionary<string, object?>)row;
                    set.Add(new Dictionary<string, object?>(dict, StringComparer.OrdinalIgnoreCase));
                }
                allSets.Add(set);
            }

            return new ExecuteReportResponse
            {
                StoredProcedure = request.StoredProcedure,
                ConnectionInfo = MaskConnectionString(request.ConnectionString),
                ResultSetCount = allSets.Count,
                ResultSets = allSets
            };
        }

        private static void ValidateRequestBasics(ExecuteAnyReportRequest request)
        {
            if (request is null) throw new ArgumentNullException(nameof(request));
            if (string.IsNullOrWhiteSpace(request.StoredProcedure))
                throw new ArgumentException("El nombre del procedimiento es requerido.", nameof(request.StoredProcedure));
            if (string.IsNullOrWhiteSpace(request.ConnectionString))
                throw new ArgumentException("La cadena de conexión es requerida.", nameof(request.ConnectionString));

            _ = new SqlConnectionStringBuilder(request.ConnectionString);
        }

        private static DynamicParameters ToDynamicParameters(Dictionary<string, object?>? parameters)
        {
            var dp = new DynamicParameters();
            if (parameters == null) return dp;

            foreach (var kv in parameters)
            {
                var name = (kv.Key ?? string.Empty).TrimStart('@');

                object? value = CoerceObject(kv.Value);

                dp.Add($"@{name}", value ?? DBNull.Value);
            }
            return dp;
        }

        private static object? CoerceObject(object? val)
        {
            if (val is null) return null;
            if (val is JsonElement je) return CoerceJsonElement(je);

            if (val is string s) return CoerceFromString(s);
            if (val is JsonDocument jd) return jd.RootElement.GetRawText();

            return val;
        }

        private static object? CoerceJsonElement(JsonElement je)
        {
            switch (je.ValueKind)
            {
                case JsonValueKind.Null:
                case JsonValueKind.Undefined:
                    return null;

                case JsonValueKind.True:
                case JsonValueKind.False:
                    return je.GetBoolean();

                case JsonValueKind.Number:
                    if (je.TryGetInt32(out var i)) return i;
                    if (je.TryGetInt64(out var l)) return l;
                    if (je.TryGetDecimal(out var dec)) return dec;
                    if (je.TryGetDouble(out var dbl)) return dbl;
                    return je.ToString();

                case JsonValueKind.String:
                    var s = je.GetString() ?? string.Empty;
                    return CoerceFromString(s);

                case JsonValueKind.Object:
                case JsonValueKind.Array:
                    return je.GetRawText();

                default:
                    return je.ToString();
            }
        }

        private static object CoerceFromString(string s)
        {
            if (string.IsNullOrEmpty(s)) return string.Empty;

            if (DateTimeOffset.TryParse(s, out var dto)) return dto;
            if (DateTime.TryParse(s, out var dt)) return dt;
            if (Guid.TryParse(s, out var g)) return g;
            if (TimeSpan.TryParse(s, out var ts)) return ts;
            if (bool.TryParse(s, out var b)) return b;

            if (int.TryParse(s, out var si)) return si;
            if (long.TryParse(s, out var sl)) return sl;
            if (decimal.TryParse(s, out var sdec)) return sdec;
            if (double.TryParse(s, out var sdbl)) return sdbl;

            return s;
        }
        private static string MaskConnectionString(string raw)
        {
            try
            {
                var b = new SqlConnectionStringBuilder(raw);
                var ds = b.DataSource ?? "(unknown)";
                var db = b.InitialCatalog ?? "(unknown)";
                return $"DataSource={ds}; InitialCatalog={db}";
            }
            catch
            {
                return "(invalid connection string)";
            }
        }
    }
}
