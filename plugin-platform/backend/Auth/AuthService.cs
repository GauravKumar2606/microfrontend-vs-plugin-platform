namespace PluginRegistry.Auth;

public class AuthService(TokenService tokenService)
{
    private static readonly Dictionary<string, (string Password, UserDto User)> Users = new()
    {
        ["cust1@ORG01"]   = ("pass123", new UserDto("1", "cust1",   "Jane Doe",   "CUSTOMER",       "ORG01")),
        ["teller1@ORG01"] = ("pass123", new UserDto("2", "teller1", "Bob Smith",  "TELLER",         "ORG01")),
        ["admin1@ORG01"]  = ("pass123", new UserDto("3", "admin1",  "Alice Admin","PLATFORM_ADMIN", "ORG01")),
    };

    public UserDto? Validate(LoginRequest request)
    {
        var key = $"{request.Username}@{request.TenantId}";
        if (!Users.TryGetValue(key, out var entry)) return null;
        return entry.Password != request.Password ? null : entry.User;
    }

    public string GenerateToken(UserDto user) => tokenService.GenerateToken(user);
}
