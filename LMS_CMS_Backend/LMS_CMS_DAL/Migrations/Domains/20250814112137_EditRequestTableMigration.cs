using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class EditRequestTableMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SeenOrNotByTransferee",
                table: "Request");

            migrationBuilder.RenameColumn(
                name: "TransfereeID",
                table: "Request",
                newName: "ForwardedToID");

            migrationBuilder.AddColumn<long>(
                name: "ForwardedFromID",
                table: "Request",
                type: "bigint",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ForwardedFromID",
                table: "Request");

            migrationBuilder.RenameColumn(
                name: "ForwardedToID",
                table: "Request",
                newName: "TransfereeID");

            migrationBuilder.AddColumn<bool>(
                name: "SeenOrNotByTransferee",
                table: "Request",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
