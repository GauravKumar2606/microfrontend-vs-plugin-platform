namespace PluginRegistry.Plugins;

public class PluginService(PluginRepository repo)
{
    public IEnumerable<PluginDto> GetEnabledForUser(string tenantId, string role) =>
        repo.GetEnabledForTenant(tenantId, role).Select(ToDto);

    public IEnumerable<PluginDto> GetAllApproved() =>
        repo.GetApproved().Select(ToDto);

    public IEnumerable<PluginDto> GetAll() =>
        repo.GetAll().Select(ToDto);

    public IEnumerable<TenantPluginDto> GetTenantPlugins(string tenantId) =>
        repo.GetTenantPlugins(tenantId).Select(tp => new TenantPluginDto(tp.TenantId, tp.PluginId, tp.AllowedRoles));

    public string Submit(SubmitPluginRequest req, string vendorId)
    {
        var record = new PluginRecord
        {
            Name = req.Name, Version = req.Version, VendorId = vendorId,
            BundleUrl = req.BundleUrl, Checksum = req.Checksum,
            TagName = req.TagName, Placements = req.Placements, Permissions = req.Permissions
        };
        repo.Add(record);
        return record.Id;
    }

    public void Approve(string id) => repo.UpdateStatus(id, PluginStatus.Approved);
    public void Reject(string id)  => repo.UpdateStatus(id, PluginStatus.Rejected);

    public void ActivateForTenant(string tenantId, string pluginId, string[] roles) =>
        repo.AddTenantPlugin(new TenantPlugin { TenantId = tenantId, PluginId = pluginId, AllowedRoles = roles });

    public void DeactivateForTenant(string tenantId, string pluginId) =>
        repo.RemoveTenantPlugin(tenantId, pluginId);

    private static PluginDto ToDto(PluginRecord p) =>
        new(p.Id, p.Version, p.VendorId, p.BundleUrl, p.Checksum, p.TagName, p.Placements, p.Permissions);
}

public record TenantPluginDto(string TenantId, string PluginId, string[] AllowedRoles);
