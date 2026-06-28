namespace BankingApi.Auth;

// In production: validate against a real user store / AD.
// For Plan 1, uses hardcoded seed users to unblock frontend development.
public class AuthService(TokenService tokenService)
{
    private static readonly Dictionary<string, (string Password, UserDto User)> Users = new()
    {
        ["teller1"] = ("pass123", new UserDto("1", "teller1", "Alice Smith", "TELLER", "BR01")),
        ["admin1"]  = ("pass123", new UserDto("2", "admin1",  "Bob Jones",  "ADMIN",  "BR01")),
    };

    public TokenResponse? Login(LoginRequest request)
    {
        if (!Users.TryGetValue(request.Username, out var entry)) return null;
        if (entry.Password != request.Password) return null;

        var token = tokenService.GenerateToken(entry.User);
        return new TokenResponse(token, entry.User);
    }
}
