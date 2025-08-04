using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class CanReciieveFromParentMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CanReceiveMessageFromParent",
                table: "Employee",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "CanReceiveRequestFromParent",
                table: "Employee",
                type: "bit",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CanReceiveMessageFromParent",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "CanReceiveRequestFromParent",
                table: "Employee");
        }
    }
}
