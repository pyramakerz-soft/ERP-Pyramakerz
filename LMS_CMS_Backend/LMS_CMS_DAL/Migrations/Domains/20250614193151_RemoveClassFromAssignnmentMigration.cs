using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class RemoveClassFromAssignnmentMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssignmentClassroomStudent");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AssignmentClassroomStudent",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssignmentID = table.Column<long>(type: "bigint", nullable: false),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    StudentClassroomID = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssignmentClassroomStudent", x => x.ID);
                    table.ForeignKey(
                        name: "FK_AssignmentClassroomStudent_Assignment_AssignmentID",
                        column: x => x.AssignmentID,
                        principalTable: "Assignment",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssignmentClassroomStudent_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentClassroomStudent_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentClassroomStudent_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentClassroomStudent_StudentClassroom_StudentClassroomID",
                        column: x => x.StudentClassroomID,
                        principalTable: "StudentClassroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentClassroomStudent_AssignmentID",
                table: "AssignmentClassroomStudent",
                column: "AssignmentID");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentClassroomStudent_DeletedByUserId",
                table: "AssignmentClassroomStudent",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentClassroomStudent_InsertedByUserId",
                table: "AssignmentClassroomStudent",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentClassroomStudent_StudentClassroomID",
                table: "AssignmentClassroomStudent",
                column: "StudentClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentClassroomStudent_UpdatedByUserId",
                table: "AssignmentClassroomStudent",
                column: "UpdatedByUserId");
        }
    }
}
