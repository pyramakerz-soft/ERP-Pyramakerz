using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class SocialWorkerConduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Attendance",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    AcademicYearID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_Attendance", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Attendance_AcademicYear_AcademicYearID",
                        column: x => x.AcademicYearID,
                        principalTable: "AcademicYear",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Attendance_Classroom_ClassroomID",
                        column: x => x.ClassroomID,
                        principalTable: "Classroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Attendance_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Attendance_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Attendance_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "ConductLevel",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
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
                    table.PrimaryKey("PK_ConductLevel", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ConductLevel_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ConductLevel_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ConductLevel_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "ProcedureType",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
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
                    table.PrimaryKey("PK_ProcedureType", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ProcedureType_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ProcedureType_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ProcedureType_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "AttendanceStudent",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsLate = table.Column<bool>(type: "bit", nullable: false),
                    IsAbsent = table.Column<bool>(type: "bit", nullable: false),
                    LateTimeInMinutes = table.Column<int>(type: "int", nullable: true),
                    StudentID = table.Column<long>(type: "bigint", nullable: false),
                    AttendanceID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_AttendanceStudent", x => x.ID);
                    table.ForeignKey(
                        name: "FK_AttendanceStudent_Attendance_AttendanceID",
                        column: x => x.AttendanceID,
                        principalTable: "Attendance",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceStudent_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AttendanceStudent_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AttendanceStudent_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AttendanceStudent_Student_StudentID",
                        column: x => x.StudentID,
                        principalTable: "Student",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ConductType",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    en_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ar_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ConductLevelID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_ConductType", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ConductType_ConductLevel_ConductLevelID",
                        column: x => x.ConductLevelID,
                        principalTable: "ConductLevel",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConductType_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ConductType_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ConductType_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Conduct",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Details = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    IsSendSMSToParent = table.Column<bool>(type: "bit", nullable: false),
                    File = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StudentID = table.Column<long>(type: "bigint", nullable: false),
                    ConductTypeID = table.Column<long>(type: "bigint", nullable: false),
                    ProcedureTypeID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_Conduct", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Conduct_ConductType_ConductTypeID",
                        column: x => x.ConductTypeID,
                        principalTable: "ConductType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Conduct_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Conduct_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Conduct_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Conduct_ProcedureType_ProcedureTypeID",
                        column: x => x.ProcedureTypeID,
                        principalTable: "ProcedureType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Conduct_Student_StudentID",
                        column: x => x.StudentID,
                        principalTable: "Student",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ConductTypeSection",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ConductTypeID = table.Column<long>(type: "bigint", nullable: false),
                    SectionID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_ConductTypeSection", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ConductTypeSection_ConductType_ConductTypeID",
                        column: x => x.ConductTypeID,
                        principalTable: "ConductType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConductTypeSection_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ConductTypeSection_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ConductTypeSection_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ConductTypeSection_Section_SectionID",
                        column: x => x.SectionID,
                        principalTable: "Section",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Attendance_AcademicYearID",
                table: "Attendance",
                column: "AcademicYearID");

            migrationBuilder.CreateIndex(
                name: "IX_Attendance_ClassroomID",
                table: "Attendance",
                column: "ClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_Attendance_DeletedByUserId",
                table: "Attendance",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Attendance_InsertedByUserId",
                table: "Attendance",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Attendance_UpdatedByUserId",
                table: "Attendance",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceStudent_AttendanceID",
                table: "AttendanceStudent",
                column: "AttendanceID");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceStudent_DeletedByUserId",
                table: "AttendanceStudent",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceStudent_InsertedByUserId",
                table: "AttendanceStudent",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceStudent_StudentID",
                table: "AttendanceStudent",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceStudent_UpdatedByUserId",
                table: "AttendanceStudent",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Conduct_ConductTypeID",
                table: "Conduct",
                column: "ConductTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Conduct_DeletedByUserId",
                table: "Conduct",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Conduct_InsertedByUserId",
                table: "Conduct",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Conduct_ProcedureTypeID",
                table: "Conduct",
                column: "ProcedureTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Conduct_StudentID",
                table: "Conduct",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_Conduct_UpdatedByUserId",
                table: "Conduct",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConductLevel_DeletedByUserId",
                table: "ConductLevel",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConductLevel_InsertedByUserId",
                table: "ConductLevel",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConductLevel_UpdatedByUserId",
                table: "ConductLevel",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConductType_ConductLevelID",
                table: "ConductType",
                column: "ConductLevelID");

            migrationBuilder.CreateIndex(
                name: "IX_ConductType_DeletedByUserId",
                table: "ConductType",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConductType_InsertedByUserId",
                table: "ConductType",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConductType_UpdatedByUserId",
                table: "ConductType",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConductTypeSection_ConductTypeID",
                table: "ConductTypeSection",
                column: "ConductTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_ConductTypeSection_DeletedByUserId",
                table: "ConductTypeSection",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConductTypeSection_InsertedByUserId",
                table: "ConductTypeSection",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConductTypeSection_SectionID",
                table: "ConductTypeSection",
                column: "SectionID");

            migrationBuilder.CreateIndex(
                name: "IX_ConductTypeSection_UpdatedByUserId",
                table: "ConductTypeSection",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcedureType_DeletedByUserId",
                table: "ProcedureType",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcedureType_InsertedByUserId",
                table: "ProcedureType",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcedureType_UpdatedByUserId",
                table: "ProcedureType",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttendanceStudent");

            migrationBuilder.DropTable(
                name: "Conduct");

            migrationBuilder.DropTable(
                name: "ConductTypeSection");

            migrationBuilder.DropTable(
                name: "Attendance");

            migrationBuilder.DropTable(
                name: "ProcedureType");

            migrationBuilder.DropTable(
                name: "ConductType");

            migrationBuilder.DropTable(
                name: "ConductLevel");
        }
    }
}
