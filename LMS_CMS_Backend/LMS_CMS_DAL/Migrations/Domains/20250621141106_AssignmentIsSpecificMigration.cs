using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class AssignmentIsSpecificMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assignment_SubjectWeightType_SubjectWeightTypeID",
                table: "Assignment");

            migrationBuilder.CreateTable(
                name: "AssignmentStudentIsSpecific",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssignmentID = table.Column<long>(type: "bigint", nullable: false),
                    StudentClassroomID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_AssignmentStudentIsSpecific", x => x.ID);
                    table.ForeignKey(
                        name: "FK_AssignmentStudentIsSpecific_Assignment_AssignmentID",
                        column: x => x.AssignmentID,
                        principalTable: "Assignment",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssignmentStudentIsSpecific_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentStudentIsSpecific_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentStudentIsSpecific_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentStudentIsSpecific_StudentClassroom_StudentClassroomID",
                        column: x => x.StudentClassroomID,
                        principalTable: "StudentClassroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentIsSpecific_AssignmentID",
                table: "AssignmentStudentIsSpecific",
                column: "AssignmentID");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentIsSpecific_DeletedByUserId",
                table: "AssignmentStudentIsSpecific",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentIsSpecific_InsertedByUserId",
                table: "AssignmentStudentIsSpecific",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentIsSpecific_StudentClassroomID",
                table: "AssignmentStudentIsSpecific",
                column: "StudentClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentIsSpecific_UpdatedByUserId",
                table: "AssignmentStudentIsSpecific",
                column: "UpdatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Assignment_SubjectWeightType_SubjectWeightTypeID",
                table: "Assignment",
                column: "SubjectWeightTypeID",
                principalTable: "SubjectWeightType",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assignment_SubjectWeightType_SubjectWeightTypeID",
                table: "Assignment");

            migrationBuilder.DropTable(
                name: "AssignmentStudentIsSpecific");

            migrationBuilder.AddForeignKey(
                name: "FK_Assignment_SubjectWeightType_SubjectWeightTypeID",
                table: "Assignment",
                column: "SubjectWeightTypeID",
                principalTable: "SubjectWeightType",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
