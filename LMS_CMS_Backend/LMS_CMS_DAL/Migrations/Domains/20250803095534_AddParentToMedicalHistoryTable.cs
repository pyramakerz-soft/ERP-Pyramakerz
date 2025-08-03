using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class AddParentToMedicalHistoryTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "InsertedByParentID",
                table: "MedicalHistories",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicalHistories_InsertedByParentID",
                table: "MedicalHistories",
                column: "InsertedByParentID");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicalHistories_Parent_InsertedByParentID",
                table: "MedicalHistories",
                column: "InsertedByParentID",
                principalTable: "Parent",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicalHistories_Parent_InsertedByParentID",
                table: "MedicalHistories");

            migrationBuilder.DropIndex(
                name: "IX_MedicalHistories_InsertedByParentID",
                table: "MedicalHistories");

            migrationBuilder.DropColumn(
                name: "InsertedByParentID",
                table: "MedicalHistories");
        }
    }
}
