using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class addUpdatedAndDeletedByParentToMedicalHistoryTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "DeletedByParentID",
                table: "MedicalHistories",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UpdatedByParentID",
                table: "MedicalHistories",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicalHistories_DeletedByParentID",
                table: "MedicalHistories",
                column: "DeletedByParentID");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalHistories_UpdatedByParentID",
                table: "MedicalHistories",
                column: "UpdatedByParentID");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicalHistories_Parent_DeletedByParentID",
                table: "MedicalHistories",
                column: "DeletedByParentID",
                principalTable: "Parent",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicalHistories_Parent_UpdatedByParentID",
                table: "MedicalHistories",
                column: "UpdatedByParentID",
                principalTable: "Parent",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicalHistories_Parent_DeletedByParentID",
                table: "MedicalHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicalHistories_Parent_UpdatedByParentID",
                table: "MedicalHistories");

            migrationBuilder.DropIndex(
                name: "IX_MedicalHistories_DeletedByParentID",
                table: "MedicalHistories");

            migrationBuilder.DropIndex(
                name: "IX_MedicalHistories_UpdatedByParentID",
                table: "MedicalHistories");

            migrationBuilder.DropColumn(
                name: "DeletedByParentID",
                table: "MedicalHistories");

            migrationBuilder.DropColumn(
                name: "UpdatedByParentID",
                table: "MedicalHistories");
        }
    }
}
