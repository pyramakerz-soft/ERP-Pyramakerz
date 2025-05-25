using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class salesreturn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "SalesId",
                table: "InventoryMaster",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventoryMaster_SalesId",
                table: "InventoryMaster",
                column: "SalesId");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryMaster_InventoryMaster_SalesId",
                table: "InventoryMaster",
                column: "SalesId",
                principalTable: "InventoryMaster",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryMaster_InventoryMaster_SalesId",
                table: "InventoryMaster");

            migrationBuilder.DropIndex(
                name: "IX_InventoryMaster_SalesId",
                table: "InventoryMaster");

            migrationBuilder.DropColumn(
                name: "SalesId",
                table: "InventoryMaster");
        }
    }
}
