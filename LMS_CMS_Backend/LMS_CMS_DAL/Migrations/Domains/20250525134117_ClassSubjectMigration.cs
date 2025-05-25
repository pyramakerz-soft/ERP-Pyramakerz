using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class ClassSubjectMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClassroomSubject",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Hide = table.Column<bool>(type: "bit", nullable: false),
                    TeacherID = table.Column<long>(type: "bigint", nullable: true),
                    ClassroomID = table.Column<long>(type: "bigint", nullable: false),
                    SubjectID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_ClassroomSubject", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ClassroomSubject_Classroom_ClassroomID",
                        column: x => x.ClassroomID,
                        principalTable: "Classroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassroomSubject_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassroomSubject_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ClassroomSubject_Employee_TeacherID",
                        column: x => x.TeacherID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassroomSubject_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ClassroomSubject_Subject_SubjectID",
                        column: x => x.SubjectID,
                        principalTable: "Subject",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClassroomSubjectCoTeacher",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CoTeacherID = table.Column<long>(type: "bigint", nullable: false),
                    ClassroomSubjectID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_ClassroomSubjectCoTeacher", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ClassroomSubjectCoTeacher_ClassroomSubject_ClassroomSubjectID",
                        column: x => x.ClassroomSubjectID,
                        principalTable: "ClassroomSubject",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassroomSubjectCoTeacher_Employee_CoTeacherID",
                        column: x => x.CoTeacherID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassroomSubjectCoTeacher_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassroomSubjectCoTeacher_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ClassroomSubjectCoTeacher_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomSubject_ClassroomID",
                table: "ClassroomSubject",
                column: "ClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomSubject_DeletedByUserId",
                table: "ClassroomSubject",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomSubject_InsertedByUserId",
                table: "ClassroomSubject",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomSubject_SubjectID",
                table: "ClassroomSubject",
                column: "SubjectID");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomSubject_TeacherID",
                table: "ClassroomSubject",
                column: "TeacherID");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomSubject_UpdatedByUserId",
                table: "ClassroomSubject",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomSubjectCoTeacher_ClassroomSubjectID",
                table: "ClassroomSubjectCoTeacher",
                column: "ClassroomSubjectID");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomSubjectCoTeacher_CoTeacherID",
                table: "ClassroomSubjectCoTeacher",
                column: "CoTeacherID");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomSubjectCoTeacher_DeletedByUserId",
                table: "ClassroomSubjectCoTeacher",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomSubjectCoTeacher_InsertedByUserId",
                table: "ClassroomSubjectCoTeacher",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomSubjectCoTeacher_UpdatedByUserId",
                table: "ClassroomSubjectCoTeacher",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClassroomSubjectCoTeacher");

            migrationBuilder.DropTable(
                name: "ClassroomSubject");
        }
    }
}
