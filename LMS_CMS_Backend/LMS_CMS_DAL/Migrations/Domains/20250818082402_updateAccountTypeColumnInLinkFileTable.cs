using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class updateAccountTypeColumnInLinkFileTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccountType",
                table: "LinkFile");

            migrationBuilder.AddColumn<int>(
                name: "AccountType",
                table: "LinkFile",
                type: "bit",
                nullable: true);

            migrationBuilder.Sql("UPDATE LinkFile SET AccountType = 0 WHERE Id IN (1, 3, 5, 6, 8, 9, 12, 13)");
            migrationBuilder.Sql("UPDATE LinkFile SET AccountType = 1 WHERE Id IN (2, 4, 7, 10. 11)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
