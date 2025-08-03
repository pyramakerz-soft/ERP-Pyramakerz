using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class RemedialTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RemedialClassroom",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubjectID = table.Column<long>(type: "bigint", nullable: false),
                    AcademicYearID = table.Column<long>(type: "bigint", nullable: false),
                    TeacherID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_RemedialClassroom", x => x.ID);
                    table.ForeignKey(
                        name: "FK_RemedialClassroom_AcademicYear_AcademicYearID",
                        column: x => x.AcademicYearID,
                        principalTable: "AcademicYear",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RemedialClassroom_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RemedialClassroom_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_RemedialClassroom_Employee_TeacherID",
                        column: x => x.TeacherID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RemedialClassroom_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_RemedialClassroom_Subject_SubjectID",
                        column: x => x.SubjectID,
                        principalTable: "Subject",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RemedialTimeTable",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsFavourite = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_RemedialTimeTable", x => x.ID);
                    table.ForeignKey(
                        name: "FK_RemedialTimeTable_AcademicYear_AcademicYearID",
                        column: x => x.AcademicYearID,
                        principalTable: "AcademicYear",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RemedialTimeTable_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_RemedialTimeTable_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_RemedialTimeTable_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "RemedialClassroomStudent",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RemedialClassroomID = table.Column<long>(type: "bigint", nullable: false),
                    StudentID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_RemedialClassroomStudent", x => x.ID);
                    table.ForeignKey(
                        name: "FK_RemedialClassroomStudent_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_RemedialClassroomStudent_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_RemedialClassroomStudent_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_RemedialClassroomStudent_RemedialClassroom_RemedialClassroomID",
                        column: x => x.RemedialClassroomID,
                        principalTable: "RemedialClassroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RemedialClassroomStudent_Student_StudentID",
                        column: x => x.StudentID,
                        principalTable: "Student",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RemedialTimeTableDay",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PeriodIndex = table.Column<int>(type: "int", nullable: false),
                    DayId = table.Column<long>(type: "bigint", nullable: false),
                    RemedialTimeTableID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_RemedialTimeTableDay", x => x.ID);
                    table.ForeignKey(
                        name: "FK_RemedialTimeTableDay_Days_DayId",
                        column: x => x.DayId,
                        principalTable: "Days",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RemedialTimeTableDay_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_RemedialTimeTableDay_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_RemedialTimeTableDay_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_RemedialTimeTableDay_RemedialTimeTable_RemedialTimeTableID",
                        column: x => x.RemedialTimeTableID,
                        principalTable: "RemedialTimeTable",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RemedialTimeTableClasses",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RemedialTimeTableDayId = table.Column<long>(type: "bigint", nullable: false),
                    RemedialClassroomID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_RemedialTimeTableClasses", x => x.ID);
                    table.ForeignKey(
                        name: "FK_RemedialTimeTableClasses_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_RemedialTimeTableClasses_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_RemedialTimeTableClasses_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_RemedialTimeTableClasses_RemedialClassroom_RemedialClassroomID",
                        column: x => x.RemedialClassroomID,
                        principalTable: "RemedialClassroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RemedialTimeTableClasses_RemedialTimeTableDay_RemedialTimeTableDayId",
                        column: x => x.RemedialTimeTableDayId,
                        principalTable: "RemedialTimeTableDay",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RemedialClassroom_AcademicYearID",
                table: "RemedialClassroom",
                column: "AcademicYearID");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialClassroom_DeletedByUserId",
                table: "RemedialClassroom",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialClassroom_InsertedByUserId",
                table: "RemedialClassroom",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialClassroom_SubjectID",
                table: "RemedialClassroom",
                column: "SubjectID");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialClassroom_TeacherID",
                table: "RemedialClassroom",
                column: "TeacherID");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialClassroom_UpdatedByUserId",
                table: "RemedialClassroom",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialClassroomStudent_DeletedByUserId",
                table: "RemedialClassroomStudent",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialClassroomStudent_InsertedByUserId",
                table: "RemedialClassroomStudent",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialClassroomStudent_RemedialClassroomID",
                table: "RemedialClassroomStudent",
                column: "RemedialClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialClassroomStudent_StudentID",
                table: "RemedialClassroomStudent",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialClassroomStudent_UpdatedByUserId",
                table: "RemedialClassroomStudent",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialTimeTable_AcademicYearID",
                table: "RemedialTimeTable",
                column: "AcademicYearID");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialTimeTable_DeletedByUserId",
                table: "RemedialTimeTable",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialTimeTable_InsertedByUserId",
                table: "RemedialTimeTable",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialTimeTable_UpdatedByUserId",
                table: "RemedialTimeTable",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialTimeTableClasses_DeletedByUserId",
                table: "RemedialTimeTableClasses",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialTimeTableClasses_InsertedByUserId",
                table: "RemedialTimeTableClasses",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialTimeTableClasses_RemedialClassroomID",
                table: "RemedialTimeTableClasses",
                column: "RemedialClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialTimeTableClasses_RemedialTimeTableDayId",
                table: "RemedialTimeTableClasses",
                column: "RemedialTimeTableDayId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialTimeTableClasses_UpdatedByUserId",
                table: "RemedialTimeTableClasses",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialTimeTableDay_DayId",
                table: "RemedialTimeTableDay",
                column: "DayId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialTimeTableDay_DeletedByUserId",
                table: "RemedialTimeTableDay",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialTimeTableDay_InsertedByUserId",
                table: "RemedialTimeTableDay",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialTimeTableDay_RemedialTimeTableID",
                table: "RemedialTimeTableDay",
                column: "RemedialTimeTableID");

            migrationBuilder.CreateIndex(
                name: "IX_RemedialTimeTableDay_UpdatedByUserId",
                table: "RemedialTimeTableDay",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RemedialClassroomStudent");

            migrationBuilder.DropTable(
                name: "RemedialTimeTableClasses");

            migrationBuilder.DropTable(
                name: "RemedialClassroom");

            migrationBuilder.DropTable(
                name: "RemedialTimeTableDay");

            migrationBuilder.DropTable(
                name: "RemedialTimeTable");
        }
    }
}
