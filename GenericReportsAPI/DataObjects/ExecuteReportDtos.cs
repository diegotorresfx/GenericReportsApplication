using System.ComponentModel.DataAnnotations;

namespace DataObjects
{
    public sealed class ExecuteReportRequest
    {
        public Dictionary<string, object?> Parameters { get; set; } = new();

        [Range(1, 600)]
        public int? TimeoutSeconds { get; set; } = 60;
    }

    public sealed class ExecuteReportResponse
    {
        public string StoredProcedure { get; set; } = string.Empty;
        public int ResultSetCount { get; set; }
        public List<List<Dictionary<string, object?>>> ResultSets { get; set; } = new();
    }

    public sealed class ReportMetadataDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string StoredProcedure { get; set; } = string.Empty;
        public bool Enabled { get; set; }
        public string ConnectionInfo { get; set; } = string.Empty;
        public DateTime CreatedAtUtc { get; set; }
        public DateTime? UpdatedAtUtc { get; set; }
    }
}
