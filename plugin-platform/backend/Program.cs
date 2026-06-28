using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PluginRegistry.Auth;
using PluginRegistry.Data;
using PluginRegistry.Plugins;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var cfg = builder.Configuration;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, ValidateAudience = true,
            ValidateLifetime = true, ValidateIssuerSigningKey = true,
            ValidIssuer = cfg["Jwt:Issuer"], ValidAudience = cfg["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(cfg["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddSingleton<TokenService>();
builder.Services.AddSingleton<AuthService>();

builder.Services.AddDbContext<PluginDbContext>(options =>
    options.UseSqlite("Data Source=plugin-registry.db"));

builder.Services.AddScoped<PluginRepository>();
builder.Services.AddScoped<PluginService>();

builder.Services.AddCors(o => o.AddPolicy("HostPolicy", p =>
    p.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()!)
     .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

var app = builder.Build();

// Auto-migrate and seed on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PluginDbContext>();
    db.Database.Migrate();
}

app.UseCors("HostPolicy");
app.UseAuthentication();
app.UseAuthorization();

app.MapPost("/api/auth/login", (LoginRequest req, AuthService auth, PluginService plugins) =>
{
    var user = auth.Validate(req);
    if (user is null) return Results.Unauthorized();
    var token = auth.GenerateToken(user);
    var enabledPlugins = plugins.GetEnabledForUser(user.TenantId, user.Role);
    return Results.Ok(new TokenResponse(token, user, enabledPlugins));
});

app.MapPost("/api/auth/logout", (HttpContext ctx) =>
{
    ctx.Response.Cookies.Delete("refreshToken");
    return Results.Ok();
});

app.MapGet("/api/plugins/enabled", (ClaimsPrincipal user, PluginService plugins) =>
{
    var tenantId = user.FindFirst("tenantId")?.Value ?? "";
    var role = user.FindFirst(ClaimTypes.Role)?.Value ?? "";
    return Results.Ok(plugins.GetEnabledForUser(tenantId, role));
}).RequireAuthorization();

app.MapGet("/api/marketplace/plugins",
    (PluginService plugins) => Results.Ok(plugins.GetAllApproved()))
    .RequireAuthorization();

app.MapPost("/api/marketplace/plugins",
    (SubmitPluginRequest req, ClaimsPrincipal user, PluginService plugins) =>
    {
        var vendorId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "unknown";
        var id = plugins.Submit(req, vendorId);
        return Results.Created($"/api/marketplace/plugins/{id}", new { id });
    }).RequireAuthorization();

app.MapPut("/api/marketplace/plugins/{id}/approve",
    (string id, PluginService plugins) => { plugins.Approve(id); return Results.Ok(); })
    .RequireAuthorization(policy => policy.RequireRole("PLATFORM_ADMIN"));

app.MapPut("/api/marketplace/plugins/{id}/reject",
    (string id, PluginService plugins) => { plugins.Reject(id); return Results.Ok(); })
    .RequireAuthorization(policy => policy.RequireRole("PLATFORM_ADMIN"));

// Tenant plugin activation (bank admins)
app.MapGet("/api/tenants/{tenantId}/plugins",
    (string tenantId, PluginService plugins) => Results.Ok(plugins.GetTenantPlugins(tenantId)))
    .RequireAuthorization();

app.MapPost("/api/tenants/{tenantId}/plugins",
    (string tenantId, ActivatePluginRequest req, PluginService plugins) =>
    {
        plugins.ActivateForTenant(tenantId, req.PluginId, req.AllowedRoles);
        return Results.Ok();
    }).RequireAuthorization(p => p.RequireRole("ADMIN", "PLATFORM_ADMIN"));

app.MapDelete("/api/tenants/{tenantId}/plugins/{pluginId}",
    (string tenantId, string pluginId, PluginService plugins) =>
    {
        plugins.DeactivateForTenant(tenantId, pluginId);
        return Results.Ok();
    }).RequireAuthorization(p => p.RequireRole("ADMIN", "PLATFORM_ADMIN"));

// Admin: list all plugins regardless of status
app.MapGet("/api/admin/plugins",
    (PluginService plugins) => Results.Ok(plugins.GetAll()))
    .RequireAuthorization(p => p.RequireRole("PLATFORM_ADMIN"));

app.Run();
