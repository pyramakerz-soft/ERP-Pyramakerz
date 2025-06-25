using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class InsertNullDateToTaxIssuer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "TaxIssuers",
                columns: new[]
                {
                    "ID", "TypeID", "Name", "ActivityCode", "BranchID", "CountryCode",
                    "Governate", "RegionCity", "Street", "BuildingNumber", "PostalCode",
                    "Floor", "Room", "LandMark", "AdditionalInfo"
                },
                values: new object[]
                {
                    "1", null, "", "", "", "",
                    "", "", "", "", "",
                    "", "", "", ""
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TaxPayers",
                keyColumn: "ID",
                keyValue: "1"
            );
        }
    }
}
