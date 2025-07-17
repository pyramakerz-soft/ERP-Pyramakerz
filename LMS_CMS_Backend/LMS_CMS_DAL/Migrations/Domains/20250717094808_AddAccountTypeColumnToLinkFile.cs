using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class AddAccountTypeColumnToLinkFile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccountType",
                table: "LinkFile",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.Sql("UPDATE LinkFile SET AccountType = 'Debit' WHERE Id IN (1, 3, 5, 6, 8, 9, 13)");
            migrationBuilder.Sql("UPDATE LinkFile SET AccountType = 'Credit' WHERE Id IN (2, 4, 7)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccountType",
                table: "LinkFile");
        }
    }
}
