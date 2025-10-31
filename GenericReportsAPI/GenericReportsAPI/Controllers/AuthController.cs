using DataObjects;
using BusinessLogic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAsesores.Controllers;

public sealed class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly ApiAuthOptions _auth;
    private readonly IJwtTokenService _jwt;

    public AuthController(ApiAuthOptions auth, IJwtTokenService jwt)
    {
        _auth = auth;
        _jwt = jwt;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest("Username y Password son requeridos.");

        if (!req.Username.Equals(_auth.Username, StringComparison.Ordinal) ||
            !req.Password.Equals(_auth.Password, StringComparison.Ordinal))
        {
            return Unauthorized();
        }

        var token = _jwt.CreateToken(req.Username);
        return Ok(new { token });
    }
}
