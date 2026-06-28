namespace BankingApi.Auth;

public record LoginRequest(string Username, string Password);

public record TokenResponse(string AccessToken, UserDto User);

public record UserDto(
    string Id,
    string Username,
    string FullName,
    string Role,
    string BranchCode
);
