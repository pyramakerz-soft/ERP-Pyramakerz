using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class StudentClassGradeContextMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StudentClassroom_Classroom_ClassID",
                table: "StudentClassroom");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentClassroom_Student_StudentID",
                table: "StudentClassroom");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentGrade_AcademicYear_AcademicYearID",
                table: "StudentGrade");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentGrade_Grade_GradeID",
                table: "StudentGrade");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentGrade_Student_StudentID",
                table: "StudentGrade");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentClassroom_Classroom_ClassID",
                table: "StudentClassroom",
                column: "ClassID",
                principalTable: "Classroom",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentClassroom_Student_StudentID",
                table: "StudentClassroom",
                column: "StudentID",
                principalTable: "Student",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentGrade_AcademicYear_AcademicYearID",
                table: "StudentGrade",
                column: "AcademicYearID",
                principalTable: "AcademicYear",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentGrade_Grade_GradeID",
                table: "StudentGrade",
                column: "GradeID",
                principalTable: "Grade",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentGrade_Student_StudentID",
                table: "StudentGrade",
                column: "StudentID",
                principalTable: "Student",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StudentClassroom_Classroom_ClassID",
                table: "StudentClassroom");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentClassroom_Student_StudentID",
                table: "StudentClassroom");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentGrade_AcademicYear_AcademicYearID",
                table: "StudentGrade");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentGrade_Grade_GradeID",
                table: "StudentGrade");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentGrade_Student_StudentID",
                table: "StudentGrade");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentClassroom_Classroom_ClassID",
                table: "StudentClassroom",
                column: "ClassID",
                principalTable: "Classroom",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentClassroom_Student_StudentID",
                table: "StudentClassroom",
                column: "StudentID",
                principalTable: "Student",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentGrade_AcademicYear_AcademicYearID",
                table: "StudentGrade",
                column: "AcademicYearID",
                principalTable: "AcademicYear",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentGrade_Grade_GradeID",
                table: "StudentGrade",
                column: "GradeID",
                principalTable: "Grade",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentGrade_Student_StudentID",
                table: "StudentGrade",
                column: "StudentID",
                principalTable: "Student",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
