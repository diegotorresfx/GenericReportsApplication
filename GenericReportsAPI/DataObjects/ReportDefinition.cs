using System;
using System.ComponentModel.DataAnnotations;

namespace DataObjects
{
    public sealed class ReportDefinition
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ConnectionString { get; set; } = string.Empty;
        public string StoredProcedure { get; set; } = string.Empty;
        public bool Enabled { get; set; } = true;
        public DateTime CreatedAtUtc { get; set; }
        public DateTime? UpdatedAtUtc { get; set; }
    }

    public sealed class CreateReportDto
    {
        [Required, MaxLength(100)]
        public string ReportId { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(1024)]
        public string ConnectionString { get; set; } = string.Empty;

        [Required, MaxLength(256)]
        public string StoredProcedure { get; set; } = string.Empty;

        public bool Enabled { get; set; } = true;
    }

    public sealed class UpdateReportDto
    {
        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(1024)]
        public string ConnectionString { get; set; } = string.Empty;

        [Required, MaxLength(256)]
        public string StoredProcedure { get; set; } = string.Empty;

        public bool Enabled { get; set; } = true;
    }
}
