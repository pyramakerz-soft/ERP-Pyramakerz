using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class salaryCalcTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DayStatus",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DayStatus", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "SalaryHistory",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Month = table.Column<int>(type: "int", nullable: false),
                    BasicSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalBonus = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalOvertime = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalDeductions = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalLoans = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAbsencePenalty = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NetSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EmployeeId = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_SalaryHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalaryHistory_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SalaryHistory_Employee_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SalaryHistory_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_SalaryHistory_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "MonthlyAttendance",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Day = table.Column<DateOnly>(type: "date", nullable: false),
                    WorkingHours = table.Column<double>(type: "float", nullable: false),
                    LateHours = table.Column<int>(type: "int", nullable: false),
                    LateMinutes = table.Column<int>(type: "int", nullable: false),
                    OvertimeHours = table.Column<int>(type: "int", nullable: false),
                    OvertimeMinutes = table.Column<int>(type: "int", nullable: false),
                    LeaveRequestHours = table.Column<int>(type: "int", nullable: false),
                    LeaveRequestMinutes = table.Column<int>(type: "int", nullable: false),
                    EmployeeId = table.Column<long>(type: "bigint", nullable: false),
                    DayStatusId = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_MonthlyAttendance", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MonthlyAttendance_DayStatus_DayStatusId",
                        column: x => x.DayStatusId,
                        principalTable: "DayStatus",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MonthlyAttendance_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MonthlyAttendance_Employee_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MonthlyAttendance_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_MonthlyAttendance_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyAttendance_DayStatusId",
                table: "MonthlyAttendance",
                column: "DayStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyAttendance_DeletedByUserId",
                table: "MonthlyAttendance",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyAttendance_EmployeeId",
                table: "MonthlyAttendance",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyAttendance_InsertedByUserId",
                table: "MonthlyAttendance",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyAttendance_UpdatedByUserId",
                table: "MonthlyAttendance",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SalaryHistory_DeletedByUserId",
                table: "SalaryHistory",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SalaryHistory_EmployeeId",
                table: "SalaryHistory",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_SalaryHistory_InsertedByUserId",
                table: "SalaryHistory",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SalaryHistory_UpdatedByUserId",
                table: "SalaryHistory",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MonthlyAttendance");

            migrationBuilder.DropTable(
                name: "SalaryHistory");

            migrationBuilder.DropTable(
                name: "DayStatus");
        }
    }
}
