using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

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
        public List<ReportParameterDefinition> ParametersDefinition { get; set; } = new();
    }

    public sealed class ReportParameterDefinition
    {
        public int Id { get; set; }
        public int ReportDefinitionId { get; set; }

        // Estas propiedades se mapearán a JSON "name" y "type",
        // que es lo que usa Angular
        [JsonPropertyName("name")]
        public string ParamName { get; set; } = string.Empty;

        [JsonPropertyName("type")]
        public string ParamType { get; set; } = string.Empty;

        // Estos nombres ya encajan bien con Angular: "defaultValue"
        // (la coincidencia es case-insensitive, pero lo dejamos explícito)
        [JsonPropertyName("defaultValue")]
        public string? DefaultValue { get; set; }

        // Por ahora Angular no los envía, pero los dejamos listos
        // por si después los agregas al front
        [JsonPropertyName("isRequired")]
        public bool IsRequired { get; set; }

        [JsonPropertyName("displayOrder")]
        public int DisplayOrder { get; set; }
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
