using PluginRegistry.Plugins;

namespace PluginRegistry.Auth;

public record LoginRequest(string Username, string Password, string TenantId);
public record TokenResponse(string AccessToken, UserDto User, IEnumerable<PluginDto> EnabledPlugins);
public record UserDto(string Id, string Username, string FullName, string Role, string TenantId);
