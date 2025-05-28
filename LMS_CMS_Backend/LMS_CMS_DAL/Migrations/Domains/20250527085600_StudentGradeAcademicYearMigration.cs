using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class StudentGradeAcademicYearMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "AcademicYearID",
                table: "StudentGrade",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_StudentGrade_AcademicYearID",
                table: "StudentGrade",
                column: "AcademicYearID");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentGrade_AcademicYear_AcademicYearID",
                table: "StudentGrade",
                column: "AcademicYearID",
                principalTable: "AcademicYear",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StudentGrade_AcademicYear_AcademicYearID",
                table: "StudentGrade");

            migrationBuilder.DropIndex(
                name: "IX_StudentGrade_AcademicYearID",
                table: "StudentGrade");

            migrationBuilder.DropColumn(
                name: "AcademicYearID",
                table: "StudentGrade");
        }
    }
}
