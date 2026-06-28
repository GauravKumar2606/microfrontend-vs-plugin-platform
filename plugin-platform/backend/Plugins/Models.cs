using System.ComponentModel.DataAnnotations;

namespace PluginRegistry.Plugins;

public record PluginDto(
    string Id, string Version, string VendorId,
    string BundleUrl, string Checksum, string TagName,
    string[] Placements, string[] Permissions);

public record SubmitPluginRequest(
    string Name, string Version, string BundleUrl,
    string Checksum, string TagName,
    string[] Placements, string[] Permissions);

public record ActivatePluginRequest(string PluginId, string[] AllowedRoles);

public enum PluginStatus { Pending, Approved, Rejected }

public class PluginRecord
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = "";
    public string Version { get; set; } = "";
    public string VendorId { get; set; } = "";
    public string BundleUrl { get; set; } = "";
    public string Checksum { get; set; } = "";
    public string TagName { get; set; } = "";
    public string[] Placements { get; set; } = [];
    public string[] Permissions { get; set; } = [];
    public PluginStatus Status { get; set; } = PluginStatus.Pending;
}

public class TenantPlugin
{
    public string TenantId { get; set; } = "";
    public string PluginId { get; set; } = "";
    public string[] AllowedRoles { get; set; } = [];
}
