using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class FailedStudentsMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FailedStudents",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentID = table.Column<long>(type: "bigint", nullable: false),
                    GradeID = table.Column<long>(type: "bigint", nullable: false),
                    SubjectID = table.Column<long>(type: "bigint", nullable: false),
                    AcademicYearID = table.Column<long>(type: "bigint", nullable: false),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FailedStudents", x => x.ID);
                    table.ForeignKey(
                        name: "FK_FailedStudents_AcademicYear_AcademicYearID",
                        column: x => x.AcademicYearID,
                        principalTable: "AcademicYear",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FailedStudents_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_FailedStudents_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_FailedStudents_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_FailedStudents_Grade_GradeID",
                        column: x => x.GradeID,
                        principalTable: "Grade",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FailedStudents_Student_StudentID",
                        column: x => x.StudentID,
                        principalTable: "Student",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FailedStudents_Subject_SubjectID",
                        column: x => x.SubjectID,
                        principalTable: "Subject",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FailedStudents_AcademicYearID",
                table: "FailedStudents",
                column: "AcademicYearID");

            migrationBuilder.CreateIndex(
                name: "IX_FailedStudents_DeletedByUserId",
                table: "FailedStudents",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_FailedStudents_GradeID",
                table: "FailedStudents",
                column: "GradeID");

            migrationBuilder.CreateIndex(
                name: "IX_FailedStudents_InsertedByUserId",
                table: "FailedStudents",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_FailedStudents_StudentID",
                table: "FailedStudents",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_FailedStudents_SubjectID",
                table: "FailedStudents",
                column: "SubjectID");

            migrationBuilder.CreateIndex(
                name: "IX_FailedStudents_UpdatedByUserId",
                table: "FailedStudents",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FailedStudents");
        }
    }
}
