using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class TimeTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TimeTable",
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
                    table.PrimaryKey("PK_TimeTable", x => x.ID);
                    table.ForeignKey(
                        name: "FK_TimeTable_AcademicYear_AcademicYearID",
                        column: x => x.AcademicYearID,
                        principalTable: "AcademicYear",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TimeTable_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TimeTable_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TimeTable_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "TimeTableClassroom",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Day = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TimeTableID = table.Column<long>(type: "bigint", nullable: false),
                    ClassroomID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_TimeTableClassroom", x => x.ID);
                    table.ForeignKey(
                        name: "FK_TimeTableClassroom_Classroom_ClassroomID",
                        column: x => x.ClassroomID,
                        principalTable: "Classroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TimeTableClassroom_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TimeTableClassroom_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TimeTableClassroom_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TimeTableClassroom_TimeTable_TimeTableID",
                        column: x => x.TimeTableID,
                        principalTable: "TimeTable",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TimeTableSession",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TimeTableClassroomID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_TimeTableSession", x => x.ID);
                    table.ForeignKey(
                        name: "FK_TimeTableSession_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TimeTableSession_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TimeTableSession_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TimeTableSession_TimeTableClassroom_TimeTableClassroomID",
                        column: x => x.TimeTableClassroomID,
                        principalTable: "TimeTableClassroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TimeTableSubject",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TimeTableSessionID = table.Column<long>(type: "bigint", nullable: false),
                    SubjectID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_TimeTableSubject", x => x.ID);
                    table.ForeignKey(
                        name: "FK_TimeTableSubject_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TimeTableSubject_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TimeTableSubject_Employee_TeacherID",
                        column: x => x.TeacherID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TimeTableSubject_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TimeTableSubject_Subject_SubjectID",
                        column: x => x.SubjectID,
                        principalTable: "Subject",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TimeTableSubject_TimeTableSession_TimeTableSessionID",
                        column: x => x.TimeTableSessionID,
                        principalTable: "TimeTableSession",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TimeTable_AcademicYearID",
                table: "TimeTable",
                column: "AcademicYearID");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTable_DeletedByUserId",
                table: "TimeTable",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTable_InsertedByUserId",
                table: "TimeTable",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTable_UpdatedByUserId",
                table: "TimeTable",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTableClassroom_ClassroomID",
                table: "TimeTableClassroom",
                column: "ClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTableClassroom_DeletedByUserId",
                table: "TimeTableClassroom",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTableClassroom_InsertedByUserId",
                table: "TimeTableClassroom",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTableClassroom_TimeTableID",
                table: "TimeTableClassroom",
                column: "TimeTableID");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTableClassroom_UpdatedByUserId",
                table: "TimeTableClassroom",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTableSession_DeletedByUserId",
                table: "TimeTableSession",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTableSession_InsertedByUserId",
                table: "TimeTableSession",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTableSession_TimeTableClassroomID",
                table: "TimeTableSession",
                column: "TimeTableClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTableSession_UpdatedByUserId",
                table: "TimeTableSession",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTableSubject_DeletedByUserId",
                table: "TimeTableSubject",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTableSubject_InsertedByUserId",
                table: "TimeTableSubject",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTableSubject_SubjectID",
                table: "TimeTableSubject",
                column: "SubjectID");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTableSubject_TeacherID",
                table: "TimeTableSubject",
                column: "TeacherID");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTableSubject_TimeTableSessionID",
                table: "TimeTableSubject",
                column: "TimeTableSessionID");

            migrationBuilder.CreateIndex(
                name: "IX_TimeTableSubject_UpdatedByUserId",
                table: "TimeTableSubject",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TimeTableSubject");

            migrationBuilder.DropTable(
                name: "TimeTableSession");

            migrationBuilder.DropTable(
                name: "TimeTableClassroom");

            migrationBuilder.DropTable(
                name: "TimeTable");
        }
    }
}
