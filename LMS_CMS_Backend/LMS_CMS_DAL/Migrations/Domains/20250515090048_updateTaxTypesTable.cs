using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class updateTaxTypesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ArDescription",
                table: "TaxTypes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EnDescription",
                table: "TaxTypes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "TaxTypes",
                keyColumn: "ID",
                keyValue: 1,
                column: "EnDescription",
                value: "Personal");

            migrationBuilder.UpdateData(
                table: "TaxTypes",
                keyColumn: "ID",
                keyValue: 1,
                column: "ArDescription",
                value: "شخضي");

            migrationBuilder.UpdateData(
                table: "TaxTypes",
                keyColumn: "ID",
                keyValue: 2,
                column: "EnDescription",
                value: "Business");

            migrationBuilder.UpdateData(
                table: "TaxTypes",
                keyColumn: "ID",
                keyValue: 2,
                column: "ArDescription",
                value: "أعمال");

            migrationBuilder.UpdateData(
                table: "TaxTypes",
                keyColumn: "ID",
                keyValue: 3,
                column: "EnDescription",
                value: "Foreign");

            migrationBuilder.UpdateData(
                table: "TaxTypes",
                keyColumn: "ID",
                keyValue: 3,
                column: "ArDescription",
                value: "أجنبي");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArDescription",
                table: "TaxTypes");

            migrationBuilder.DropColumn(
                name: "EnDescription",
                table: "TaxTypes");
        }
    }
}
