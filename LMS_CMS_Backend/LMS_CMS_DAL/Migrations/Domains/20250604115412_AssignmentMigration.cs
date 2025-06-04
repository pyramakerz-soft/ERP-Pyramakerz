using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class AssignmentMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AssignmentType",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnglishName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ArabicName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssignmentType", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "DirectMarkClassroomStudent",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Mark = table.Column<float>(type: "real", nullable: false),
                    WeightTypeID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_DirectMarkClassroomStudent", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DirectMarkClassroomStudent_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMarkClassroomStudent_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMarkClassroomStudent_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMarkClassroomStudent_StudentClassroom_StudentClassroomID",
                        column: x => x.StudentClassroomID,
                        principalTable: "StudentClassroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DirectMarkClassroomStudent_WeightType_WeightTypeID",
                        column: x => x.WeightTypeID,
                        principalTable: "WeightType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Assignment",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnglishName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ArabicName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Mark = table.Column<float>(type: "real", nullable: false),
                    OpenDate = table.Column<DateOnly>(type: "date", nullable: false),
                    DueDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CutOfDate = table.Column<DateOnly>(type: "date", nullable: false),
                    IsSpecificStudents = table.Column<bool>(type: "bit", nullable: false),
                    LinkFile = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubjectID = table.Column<long>(type: "bigint", nullable: false),
                    AssignmentTypeID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_Assignment", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Assignment_AssignmentType_AssignmentTypeID",
                        column: x => x.AssignmentTypeID,
                        principalTable: "AssignmentType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Assignment_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Assignment_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Assignment_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Assignment_Subject_SubjectID",
                        column: x => x.SubjectID,
                        principalTable: "Subject",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AssignmentClassroomStudent",
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

            migrationBuilder.CreateTable(
                name: "AssignmentQuestion",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssignmentID = table.Column<long>(type: "bigint", nullable: false),
                    QuestionBankID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_AssignmentQuestion", x => x.ID);
                    table.ForeignKey(
                        name: "FK_AssignmentQuestion_Assignment_AssignmentID",
                        column: x => x.AssignmentID,
                        principalTable: "Assignment",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssignmentQuestion_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentQuestion_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentQuestion_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentQuestion_QuestionBank_QuestionBankID",
                        column: x => x.QuestionBankID,
                        principalTable: "QuestionBank",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AssignmentStudent",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Degree = table.Column<float>(type: "real", nullable: false),
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
                    table.PrimaryKey("PK_AssignmentStudent", x => x.ID);
                    table.ForeignKey(
                        name: "FK_AssignmentStudent_Assignment_AssignmentID",
                        column: x => x.AssignmentID,
                        principalTable: "Assignment",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssignmentStudent_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentStudent_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentStudent_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentStudent_StudentClassroom_StudentClassroomID",
                        column: x => x.StudentClassroomID,
                        principalTable: "StudentClassroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AssignmentStudentQuestion",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Mark = table.Column<float>(type: "real", nullable: false),
                    AssignmentStudentID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_AssignmentStudentQuestion", x => x.ID);
                    table.ForeignKey(
                        name: "FK_AssignmentStudentQuestion_AssignmentStudent_AssignmentStudentID",
                        column: x => x.AssignmentStudentID,
                        principalTable: "AssignmentStudent",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssignmentStudentQuestion_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentStudentQuestion_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentStudentQuestion_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_AssignmentTypeID",
                table: "Assignment",
                column: "AssignmentTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_DeletedByUserId",
                table: "Assignment",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_InsertedByUserId",
                table: "Assignment",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_SubjectID",
                table: "Assignment",
                column: "SubjectID");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_UpdatedByUserId",
                table: "Assignment",
                column: "UpdatedByUserId");

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

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentQuestion_AssignmentID",
                table: "AssignmentQuestion",
                column: "AssignmentID");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentQuestion_DeletedByUserId",
                table: "AssignmentQuestion",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentQuestion_InsertedByUserId",
                table: "AssignmentQuestion",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentQuestion_QuestionBankID",
                table: "AssignmentQuestion",
                column: "QuestionBankID");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentQuestion_UpdatedByUserId",
                table: "AssignmentQuestion",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudent_AssignmentID",
                table: "AssignmentStudent",
                column: "AssignmentID");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudent_DeletedByUserId",
                table: "AssignmentStudent",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudent_InsertedByUserId",
                table: "AssignmentStudent",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudent_StudentClassroomID",
                table: "AssignmentStudent",
                column: "StudentClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudent_UpdatedByUserId",
                table: "AssignmentStudent",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentQuestion_AssignmentStudentID",
                table: "AssignmentStudentQuestion",
                column: "AssignmentStudentID");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentQuestion_DeletedByUserId",
                table: "AssignmentStudentQuestion",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentQuestion_InsertedByUserId",
                table: "AssignmentStudentQuestion",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentQuestion_UpdatedByUserId",
                table: "AssignmentStudentQuestion",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClassroomStudent_DeletedByUserId",
                table: "DirectMarkClassroomStudent",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClassroomStudent_InsertedByUserId",
                table: "DirectMarkClassroomStudent",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClassroomStudent_StudentClassroomID",
                table: "DirectMarkClassroomStudent",
                column: "StudentClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClassroomStudent_UpdatedByUserId",
                table: "DirectMarkClassroomStudent",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClassroomStudent_WeightTypeID",
                table: "DirectMarkClassroomStudent",
                column: "WeightTypeID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssignmentClassroomStudent");

            migrationBuilder.DropTable(
                name: "AssignmentQuestion");

            migrationBuilder.DropTable(
                name: "AssignmentStudentQuestion");

            migrationBuilder.DropTable(
                name: "DirectMarkClassroomStudent");

            migrationBuilder.DropTable(
                name: "AssignmentStudent");

            migrationBuilder.DropTable(
                name: "Assignment");

            migrationBuilder.DropTable(
                name: "AssignmentType");
        }
    }
}
