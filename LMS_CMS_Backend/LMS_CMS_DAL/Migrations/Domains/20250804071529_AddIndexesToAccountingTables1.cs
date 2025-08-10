using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class AddIndexesToAccountingTables1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Supplier_IsDeleted",
                table: "Suppliers",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_PayableMaster_IsDeleted",
                table: "PayableMaster",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_PayableDetails_IsDeleted",
                table: "PayableDetails",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_PayableDetails_LinkFileTypeID",
                table: "PayableDetails",
                column: "LinkFileTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryMaster_Date",
                table: "InventoryMaster",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryMaster_IsDeleted",
                table: "InventoryMaster",
                column: "IsDeleted");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Supplier_IsDeleted",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_PayableMaster_IsDeleted",
                table: "PayableMaster");

            migrationBuilder.DropIndex(
                name: "IX_PayableDetails_IsDeleted",
                table: "PayableDetails");

            migrationBuilder.DropIndex(
                name: "IX_PayableDetails_LinkFileTypeID",
                table: "PayableDetails");

            migrationBuilder.DropIndex(
                name: "IX_InventoryMaster_Date",
                table: "InventoryMaster");

            migrationBuilder.DropIndex(
                name: "IX_InventoryMaster_IsDeleted",
                table: "InventoryMaster");
        }
    }
}
