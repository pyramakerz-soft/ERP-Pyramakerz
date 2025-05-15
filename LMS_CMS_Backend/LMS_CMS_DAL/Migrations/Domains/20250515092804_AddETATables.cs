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
            migrationBuilder.CreateTable(
                name: "TaxCustomer",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EnDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ArDescription = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaxCustomer", x => x.ID);
                });

            migrationBuilder.InsertData(
                table: "TaxCustomer",
                columns: new[] { "ID", "Type", "EnDescription", "ArDescription" },
                values: new object[,]
                {
                    { 1, "P", "Personal", "شخصي" },
                    { 2, "B", "Business", "أعمال" },
                    { 3, "F", "Foreign", "أجنبي" }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_TaxIssuers_TaxCustomer_TypeID",
                table: "TaxIssuers",
                column: "TypeID",
                principalTable: "TaxCustomer",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_TaxReceivers_TaxCustomer_TypeID",
                table: "TaxReceivers",
                column: "TypeID",
                principalTable: "TaxCustomer",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaxIssuers_TaxCustomer_TypeID",
                table: "TaxIssuers");

            migrationBuilder.DropForeignKey(
                name: "FK_TaxReceivers_TaxCustomer_TypeID",
                table: "TaxReceivers");

            migrationBuilder.DropTable(
                name: "TaxCustomer");

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
