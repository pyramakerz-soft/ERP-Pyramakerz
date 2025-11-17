using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class AcademicYearInAssignmentDirectMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "AcademicYearID",
                table: "DirectMark",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "AcademicYearID",
                table: "Assignment",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DirectMark_AcademicYearID",
                table: "DirectMark",
                column: "AcademicYearID");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_AcademicYearID",
                table: "Assignment",
                column: "AcademicYearID");

            migrationBuilder.AddForeignKey(
                name: "FK_Assignment_AcademicYear_AcademicYearID",
                table: "Assignment",
                column: "AcademicYearID",
                principalTable: "AcademicYear",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DirectMark_AcademicYear_AcademicYearID",
                table: "DirectMark",
                column: "AcademicYearID",
                principalTable: "AcademicYear",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assignment_AcademicYear_AcademicYearID",
                table: "Assignment");

            migrationBuilder.DropForeignKey(
                name: "FK_DirectMark_AcademicYear_AcademicYearID",
                table: "DirectMark");

            migrationBuilder.DropIndex(
                name: "IX_DirectMark_AcademicYearID",
                table: "DirectMark");

            migrationBuilder.DropIndex(
                name: "IX_Assignment_AcademicYearID",
                table: "Assignment");

            migrationBuilder.DropColumn(
                name: "AcademicYearID",
                table: "DirectMark");

            migrationBuilder.DropColumn(
                name: "AcademicYearID",
                table: "Assignment");
        }
    }
}
