using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class StudentSubjectMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StudentClassroomSubject",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Hide = table.Column<bool>(type: "bit", nullable: false),
                    StudentClassroomID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_StudentClassroomSubject", x => x.ID);
                    table.ForeignKey(
                        name: "FK_StudentClassroomSubject_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_StudentClassroomSubject_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_StudentClassroomSubject_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_StudentClassroomSubject_StudentClassroom_StudentClassroomID",
                        column: x => x.StudentClassroomID,
                        principalTable: "StudentClassroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentClassroomSubject_Subject_SubjectID",
                        column: x => x.SubjectID,
                        principalTable: "Subject",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StudentClassroomSubject_DeletedByUserId",
                table: "StudentClassroomSubject",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentClassroomSubject_InsertedByUserId",
                table: "StudentClassroomSubject",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentClassroomSubject_StudentClassroomID",
                table: "StudentClassroomSubject",
                column: "StudentClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_StudentClassroomSubject_SubjectID",
                table: "StudentClassroomSubject",
                column: "SubjectID");

            migrationBuilder.CreateIndex(
                name: "IX_StudentClassroomSubject_UpdatedByUserId",
                table: "StudentClassroomSubject",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StudentClassroomSubject");
        }
    }
}
