using System.Text;
using Serilog;
using DataObjects;
using BusinessLogic;
using DataLayer;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

const string CorsPolicyName = "ApiCorsPolicy";

// === Serilog files/console ===
var logDirectory = Path.Combine(AppContext.BaseDirectory, "Logs");
Directory.CreateDirectory(logDirectory);
var logFilePath = Path.Combine(logDirectory, "log-.txt");

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .WriteTo.File(
        logFilePath,
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30,
        fileSizeLimitBytes: 10_000_000,
        rollOnFileSizeLimit: true,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level}] {Message}{NewLine}{Exception}")
    .WriteTo.Console()
    .CreateLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);
    builder.Host.UseSerilog();

    // Controllers
    builder.Services.AddControllers();

    // Swagger + JWT
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "ApiAsesores", Version = "v1" });

        var securityScheme = new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Description = "JWT Bearer (ej: Bearer {token})",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
        };
        c.AddSecurityDefinition("Bearer", securityScheme);
        c.AddSecurityRequirement(new OpenApiSecurityRequirement { { securityScheme, Array.Empty<string>() } });
    });

    // ===== Options fuertemente tipadas + validación =====
    builder.Services.AddOptions<ConnectionStrings>()
        .Bind(builder.Configuration.GetSection("ConnectionStrings"))
        .ValidateDataAnnotations()
        .Validate(c => true, "ConnectionStrings bound."); // placeholder para extender validaciones

    builder.Services.AddSingleton(sp =>
        sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<ConnectionStrings>>().Value);

    builder.Services.AddOptions<JwtOptions>()
        .Bind(builder.Configuration.GetSection("Jwt"))
        .ValidateDataAnnotations()
        .Validate(j => !string.IsNullOrWhiteSpace(j.Key) && j.Key.Length >= 64,
            "Jwt:Key debe tener al menos 64 caracteres.")
        .ValidateOnStart();

    builder.Services.AddSingleton(sp =>
        sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<JwtOptions>>().Value);

    builder.Services.AddOptions<ApiAuthOptions>()
        .Bind(builder.Configuration.GetSection("ApiAuth"))
        .ValidateDataAnnotations()
        .ValidateOnStart();

    builder.Services.AddSingleton(sp =>
        sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<ApiAuthOptions>>().Value);

    // ===== CORS =====
    var allowedOrigins = builder.Configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>() ?? Array.Empty<string>();

    builder.Services.AddCors(opt =>
    {
        opt.AddPolicy(CorsPolicyName, p =>
        {
            p.WithOrigins(allowedOrigins)
             .AllowAnyHeader()
             .AllowAnyMethod()
             .AllowCredentials();
        });
    });

    // ===== JWT Auth =====
    var jwt = builder.Configuration.GetRequiredSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();
    var keyBytes = Encoding.UTF8.GetBytes(jwt.Key);
    var requireHttps = !builder.Environment.IsDevelopment();

    builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(o =>
        {
            o.RequireHttpsMetadata = requireHttps;
            o.SaveToken = true;
            o.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwt.Issuer,
                ValidateAudience = true,
                ValidAudience = jwt.Audience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(30)
            };
        });

    builder.Services.AddAuthorization();

    builder.Services.AddScoped<IReportsRepository, ReportsRepository>();
    builder.Services.AddScoped<IReportRunner, ReportRunner>();

    // Servicio emisor de tokens
    builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
    builder.Services.AddScoped<IReportsRepository, ReportsRepository>();


    var app = builder.Build();

    app.UseSerilogRequestLogging();
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();

    // CORS debe ir antes de Auth si hay preflight
    app.UseCors(CorsPolicyName);

    app.UseAuthentication(); // <=== FALTABA
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "La aplicación falló al iniciar.");
}
finally
{
    Log.CloseAndFlush();
}
