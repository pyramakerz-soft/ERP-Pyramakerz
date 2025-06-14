using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class UpdateInventoryMasterTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ETAPOSID",
                table: "InventoryMaster",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventoryMaster_ETAPOSID",
                table: "InventoryMaster",
                column: "ETAPOSID");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryMaster_ETAPOS_ETAPOSID",
                table: "InventoryMaster",
                column: "ETAPOSID",
                principalTable: "ETAPOS",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryMaster_ETAPOS_ETAPOSID",
                table: "InventoryMaster");

            migrationBuilder.DropIndex(
                name: "IX_InventoryMaster_ETAPOSID",
                table: "InventoryMaster");

            migrationBuilder.DropColumn(
                name: "ETAPOSID",
                table: "InventoryMaster");
        }
    }
}
