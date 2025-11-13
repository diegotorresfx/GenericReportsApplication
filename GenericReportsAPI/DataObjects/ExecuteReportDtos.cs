using System.ComponentModel.DataAnnotations;

namespace DataObjects
{
    public sealed class ExecuteAnyReportRequest
    {
        [Required, MinLength(1)]
        public string StoredProcedure { get; set; } = string.Empty;

        [Required, MinLength(1)]
        public string ConnectionString { get; set; } = string.Empty;

        public Dictionary<string, object?> Parameters { get; set; } = new();

        [Range(1, 600)]
        public int? TimeoutSeconds { get; set; } = 60;
    }

    public sealed class ReportNameMetadataDto
    {
        public string StoredProcedure { get; set; } = string.Empty;
        public string ConnectionInfo { get; set; } = string.Empty;
    }

    public sealed class ExecuteReportResponse
    {
        public string StoredProcedure { get; set; } = string.Empty;
        public string ConnectionInfo { get; set; } = string.Empty;
        public int ResultSetCount { get; set; }
        public List<List<Dictionary<string, object?>>> ResultSets { get; set; } = new();
    }
}
