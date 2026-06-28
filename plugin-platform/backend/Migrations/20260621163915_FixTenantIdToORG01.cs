using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class FixTenantIdToORG01 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TenantPlugins",
                keyColumns: new[] { "PluginId", "TenantId" },
                keyValues: new object[] { "sample-balance-widget", "BANK01" });

            migrationBuilder.InsertData(
                table: "TenantPlugins",
                columns: new[] { "PluginId", "TenantId", "AllowedRoles" },
                values: new object[] { "sample-balance-widget", "ORG01", "CUSTOMER,TELLER" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TenantPlugins",
                keyColumns: new[] { "PluginId", "TenantId" },
                keyValues: new object[] { "sample-balance-widget", "ORG01" });

            migrationBuilder.InsertData(
                table: "TenantPlugins",
                columns: new[] { "PluginId", "TenantId", "AllowedRoles" },
                values: new object[] { "sample-balance-widget", "BANK01", "CUSTOMER,TELLER" });
        }
    }
}
