using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class AddETATables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Country",
                table: "TaxReceivers");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "TaxReceivers");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "TaxIssuers");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "TaxIssuers");

            migrationBuilder.AddColumn<long>(
                name: "CountryID",
                table: "TaxReceivers",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TypeID",
                table: "TaxReceivers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "CountryID",
                table: "TaxIssuers",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TypeID",
                table: "TaxIssuers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ItemType",
                table: "ShopItem",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TaxTypes",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaxTypes", x => x.ID);
                });

            migrationBuilder.InsertData(
                table: "TaxTypes",
                columns: new[] { "ID", "Type" },
                values: new object[,]
                {
                    { 1, "P" },
                    { 2, "B" },
                    { 3, "F" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_TaxReceivers_TypeID",
                table: "TaxReceivers",
                column: "TypeID");

            migrationBuilder.CreateIndex(
                name: "IX_TaxIssuers_TypeID",
                table: "TaxIssuers",
                column: "TypeID");

            migrationBuilder.AddForeignKey(
                name: "FK_TaxIssuers_TaxTypes_TypeID",
                table: "TaxIssuers",
                column: "TypeID",
                principalTable: "TaxTypes",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_TaxReceivers_TaxTypes_TypeID",
                table: "TaxReceivers",
                column: "TypeID",
                principalTable: "TaxTypes",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaxIssuers_TaxTypes_TypeID",
                table: "TaxIssuers");

            migrationBuilder.DropForeignKey(
                name: "FK_TaxReceivers_TaxTypes_TypeID",
                table: "TaxReceivers");

            migrationBuilder.DropTable(
                name: "TaxTypes");

            migrationBuilder.DropIndex(
                name: "IX_TaxReceivers_TypeID",
                table: "TaxReceivers");

            migrationBuilder.DropIndex(
                name: "IX_TaxIssuers_TypeID",
                table: "TaxIssuers");

            migrationBuilder.DropColumn(
                name: "CountryID",
                table: "TaxReceivers");

            migrationBuilder.DropColumn(
                name: "TypeID",
                table: "TaxReceivers");

            migrationBuilder.DropColumn(
                name: "CountryID",
                table: "TaxIssuers");

            migrationBuilder.DropColumn(
                name: "TypeID",
                table: "TaxIssuers");

            migrationBuilder.DropColumn(
                name: "ItemType",
                table: "ShopItem");

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "TaxReceivers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "TaxReceivers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "TaxIssuers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "TaxIssuers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
