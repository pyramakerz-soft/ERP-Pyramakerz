using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class PermissionGroupDetailsMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "PermissionGroupID",
                table: "PermissionGroupDetails",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_PermissionGroupDetails_PermissionGroupID",
                table: "PermissionGroupDetails",
                column: "PermissionGroupID");

            migrationBuilder.AddForeignKey(
                name: "FK_PermissionGroupDetails_PermissionGroup_PermissionGroupID",
                table: "PermissionGroupDetails",
                column: "PermissionGroupID",
                principalTable: "PermissionGroup",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PermissionGroupDetails_PermissionGroup_PermissionGroupID",
                table: "PermissionGroupDetails");

            migrationBuilder.DropIndex(
                name: "IX_PermissionGroupDetails_PermissionGroupID",
                table: "PermissionGroupDetails");

            migrationBuilder.DropColumn(
                name: "PermissionGroupID",
                table: "PermissionGroupDetails");
        }
    }
}
