using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Plugins",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Version = table.Column<string>(type: "TEXT", nullable: false),
                    VendorId = table.Column<string>(type: "TEXT", nullable: false),
                    BundleUrl = table.Column<string>(type: "TEXT", nullable: false),
                    Checksum = table.Column<string>(type: "TEXT", nullable: false),
                    TagName = table.Column<string>(type: "TEXT", nullable: false),
                    Placements = table.Column<string>(type: "TEXT", nullable: false),
                    Permissions = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plugins", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantPlugins",
                columns: table => new
                {
                    TenantId = table.Column<string>(type: "TEXT", nullable: false),
                    PluginId = table.Column<string>(type: "TEXT", nullable: false),
                    AllowedRoles = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantPlugins", x => new { x.TenantId, x.PluginId });
                });

            migrationBuilder.InsertData(
                table: "Plugins",
                columns: new[] { "Id", "BundleUrl", "Checksum", "Name", "Permissions", "Placements", "Status", "TagName", "VendorId", "Version" },
                values: new object[] { "sample-balance-widget", "https://localhost:4300/plugin.js", "sha256:8d696e29c65c4c5b9dd652cbf10ad3bc4a76690035c0aa0f25aa059b09623e6e", "Balance Widget", "auth.getCurrentUser", "dashboard", 1, "internal-balance-widget", "internal", "1.0.0" });

            migrationBuilder.InsertData(
                table: "TenantPlugins",
                columns: new[] { "PluginId", "TenantId", "AllowedRoles" },
                values: new object[] { "sample-balance-widget", "BANK01", "CUSTOMER,TELLER" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Plugins");

            migrationBuilder.DropTable(
                name: "TenantPlugins");
        }
    }
}
