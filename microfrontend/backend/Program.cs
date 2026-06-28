using System.Security.Claims;
using System.Text;
using BankingApi.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// JWT authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var cfg = builder.Configuration;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = cfg["Jwt:Issuer"],
            ValidAudience = cfg["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(cfg["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddSingleton<TokenService>();
builder.Services.AddSingleton<AuthService>();

// CORS — allow Angular shell origin
builder.Services.AddCors(options =>
    options.AddPolicy("ShellPolicy", policy =>
        policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()!)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()));

var app = builder.Build();

app.UseCors("ShellPolicy");
app.UseAuthentication();
app.UseAuthorization();

// Auth endpoints
app.MapPost("/api/auth/login", (LoginRequest req, AuthService auth) =>
{
    var result = auth.Login(req);
    return result is null ? Results.Unauthorized() : Results.Ok(result);
});

app.MapPost("/api/auth/logout", (HttpContext ctx) =>
{
    ctx.Response.Cookies.Delete("refreshToken");
    return Results.Ok();
});

app.MapGet("/api/auth/me", (ClaimsPrincipal user) =>
    Results.Ok(new {
        Id = user.FindFirst(ClaimTypes.NameIdentifier)?.Value,
        Username = user.FindFirst(ClaimTypes.Name)?.Value,
        Role = user.FindFirst(ClaimTypes.Role)?.Value,
        BranchCode = user.FindFirst("branchCode")?.Value,
        FullName = user.FindFirst("fullName")?.Value
    })
).RequireAuthorization();

app.Run();
