using PluginRegistry.Data;
using Microsoft.EntityFrameworkCore;

namespace PluginRegistry.Plugins;

public class PluginRepository(PluginDbContext db)
{
    public IEnumerable<PluginRecord> GetApproved() =>
        db.Plugins.Where(p => p.Status == PluginStatus.Approved).ToList();

    public IEnumerable<PluginRecord> GetEnabledForTenant(string tenantId, string role)
    {
        var pluginIds = db.TenantPlugins
            .Where(tp => tp.TenantId == tenantId)
            .ToList()
            .Where(tp => tp.AllowedRoles.Contains(role))
            .Select(tp => tp.PluginId)
            .ToList();

        return db.Plugins
            .Where(p => pluginIds.Contains(p.Id) && p.Status == PluginStatus.Approved)
            .ToList();
    }

    public IEnumerable<PluginRecord> GetAll() => db.Plugins.ToList();

    public IEnumerable<TenantPlugin> GetTenantPlugins(string tenantId) =>
        db.TenantPlugins.Where(tp => tp.TenantId == tenantId).ToList();

    public void Add(PluginRecord plugin) { db.Plugins.Add(plugin); db.SaveChanges(); }

    public PluginRecord? GetById(string id) => db.Plugins.Find(id);

    public void UpdateStatus(string id, PluginStatus status)
    {
        var plugin = GetById(id);
        if (plugin is null) return;
        plugin.Status = status;
        db.SaveChanges();
    }

    public void AddTenantPlugin(TenantPlugin tp)
    {
        db.TenantPlugins.Add(tp);
        db.SaveChanges();
    }

    public void RemoveTenantPlugin(string tenantId, string pluginId)
    {
        var tp = db.TenantPlugins.Find(tenantId, pluginId);
        if (tp is null) return;
        db.TenantPlugins.Remove(tp);
        db.SaveChanges();
    }
}
