using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using PluginRegistry.Plugins;

namespace PluginRegistry.Data;

public class PluginDbContext(DbContextOptions<PluginDbContext> options) : DbContext(options)
{
    public DbSet<PluginRecord> Plugins => Set<PluginRecord>();
    public DbSet<TenantPlugin> TenantPlugins => Set<TenantPlugin>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var stringArrayComparer = new ValueComparer<string[]>(
            (a, b) => (a == null && b == null) || (a != null && b != null && a.SequenceEqual(b)),
            c => c.Aggregate(0, (h, v) => HashCode.Combine(h, v.GetHashCode())),
            c => c.ToArray());

        modelBuilder.Entity<PluginRecord>()
            .Property(p => p.Placements)
            .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries))
            .Metadata.SetValueComparer(stringArrayComparer);

        modelBuilder.Entity<PluginRecord>()
            .Property(p => p.Permissions)
            .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries))
            .Metadata.SetValueComparer(stringArrayComparer);

        modelBuilder.Entity<TenantPlugin>()
            .HasKey(tp => new { tp.TenantId, tp.PluginId });

        modelBuilder.Entity<TenantPlugin>()
            .Property(tp => tp.AllowedRoles)
            .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries))
            .Metadata.SetValueComparer(stringArrayComparer);

        // Seed data
        modelBuilder.Entity<PluginRecord>().HasData(new PluginRecord
        {
            Id = "sample-balance-widget",
            Name = "Balance Widget",
            Version = "1.0.0",
            VendorId = "internal",
            BundleUrl = "http://localhost:4300/plugin.js",
            Checksum = "sha256:8d696e29c65c4c5b9dd652cbf10ad3bc4a76690035c0aa0f25aa059b09623e6e",
            TagName = "internal-balance-widget",
            Placements = ["dashboard"],
            Permissions = ["auth.getCurrentUser"],
            Status = PluginStatus.Approved
        });

        modelBuilder.Entity<TenantPlugin>().HasData(
            new TenantPlugin { TenantId = "ORG01", PluginId = "sample-balance-widget", AllowedRoles = ["CUSTOMER", "TELLER"] }
        );
    }
}
