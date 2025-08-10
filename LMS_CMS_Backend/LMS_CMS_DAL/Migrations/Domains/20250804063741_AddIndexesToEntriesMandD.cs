using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class AddIndexesToEntriesMandD : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Date",
                table: "AccountingEntriesMaster",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_EntriesMaster_Date",
                table: "AccountingEntriesMaster",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_EntriesMaster_IsDeleted",
                table: "AccountingEntriesMaster",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_EntriesDetails_IsDeleted",
                table: "AccountingEntriesDetails",
                column: "IsDeleted");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EntriesMaster_Date",
                table: "AccountingEntriesMaster");

            migrationBuilder.DropIndex(
                name: "IX_EntriesMaster_IsDeleted",
                table: "AccountingEntriesMaster");

            migrationBuilder.DropIndex(
                name: "IX_EntriesDetails_IsDeleted",
                table: "AccountingEntriesDetails");

            migrationBuilder.AlterColumn<string>(
                name: "Date",
                table: "AccountingEntriesMaster",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
