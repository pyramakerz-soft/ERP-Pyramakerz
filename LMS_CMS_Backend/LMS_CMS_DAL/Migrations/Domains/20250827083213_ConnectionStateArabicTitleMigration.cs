using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class ConnectionStateArabicTitleMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Title",
                table: "ConnectionStatus",
                newName: "En_Title");

            migrationBuilder.AddColumn<string>(
                name: "Ar_Title",
                table: "ConnectionStatus",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Ar_Title",
                table: "ConnectionStatus");

            migrationBuilder.RenameColumn(
                name: "En_Title",
                table: "ConnectionStatus",
                newName: "Title");
        }
    }
}
