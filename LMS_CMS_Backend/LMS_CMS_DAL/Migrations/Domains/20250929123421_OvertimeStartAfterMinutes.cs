using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class OvertimeStartAfterMinutes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalAbsencePenalty",
                table: "SalaryHistory");

            migrationBuilder.RenameColumn(
                name: "LateMinutes",
                table: "MonthlyAttendance",
                newName: "DeductionMinutes");

            migrationBuilder.RenameColumn(
                name: "LateHours",
                table: "MonthlyAttendance",
                newName: "DeductionHours");

            migrationBuilder.AddColumn<int>(
                name: "OvertimeStartAfterMinutes",
                table: "SalaryConfigration",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OvertimeStartAfterMinutes",
                table: "SalaryConfigration");

            migrationBuilder.RenameColumn(
                name: "DeductionMinutes",
                table: "MonthlyAttendance",
                newName: "LateMinutes");

            migrationBuilder.RenameColumn(
                name: "DeductionHours",
                table: "MonthlyAttendance",
                newName: "LateHours");

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAbsencePenalty",
                table: "SalaryHistory",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
