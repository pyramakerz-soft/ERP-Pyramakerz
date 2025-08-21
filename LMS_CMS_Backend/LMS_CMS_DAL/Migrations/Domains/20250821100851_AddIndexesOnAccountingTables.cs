using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class AddIndexesOnAccountingTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ReceivableMaster_BankOrSaveID",
                table: "ReceivableMaster",
                column: "BankOrSaveID");

            migrationBuilder.CreateIndex(
                name: "IX_ReceivableMaster_Date",
                table: "ReceivableMaster",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_ReceivableMaster_IsDeleted",
                table: "ReceivableMaster",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_ReceivableDetails_IsDeleted",
                table: "ReceivableDetails",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_ReceivableDetails_LinkFileTypeID",
                table: "ReceivableDetails",
                column: "LinkFileTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_PayableMaster_BankOrSaveID",
                table: "PayableMaster",
                column: "BankOrSaveID");

            migrationBuilder.CreateIndex(
                name: "IX_PayableMaster_Date",
                table: "PayableMaster",
                column: "Date");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ReceivableMaster_BankOrSaveID",
                table: "ReceivableMaster");

            migrationBuilder.DropIndex(
                name: "IX_ReceivableMaster_Date",
                table: "ReceivableMaster");

            migrationBuilder.DropIndex(
                name: "IX_ReceivableMaster_IsDeleted",
                table: "ReceivableMaster");

            migrationBuilder.DropIndex(
                name: "IX_ReceivableDetails_IsDeleted",
                table: "ReceivableDetails");

            migrationBuilder.DropIndex(
                name: "IX_ReceivableDetails_LinkFileTypeID",
                table: "ReceivableDetails");

            migrationBuilder.DropIndex(
                name: "IX_PayableMaster_BankOrSaveID",
                table: "PayableMaster");

            migrationBuilder.DropIndex(
                name: "IX_PayableMaster_Date",
                table: "PayableMaster");
        }
    }
}
