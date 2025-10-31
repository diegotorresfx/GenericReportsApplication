using System.ComponentModel.DataAnnotations;

namespace DataObjects
{
    public class JwtOptions
    {
        [Required]
        public string Issuer { get; set; } = string.Empty;

        [Required]
        public string Audience { get; set; } = string.Empty;

        [Required, MinLength(64, ErrorMessage = "Jwt:Key debe tener al menos 64 caracteres.")]
        public string Key { get; set; } = string.Empty;

        [Range(1, 24 * 60)]
        public int ExpiresMinutes { get; set; } = 60;
    }
}
