using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class MaintenanceEmployeeMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceEmployees_Employee_MaintenanceEmployeeID",
                table: "MaintenanceEmployees");

            migrationBuilder.RenameColumn(
                name: "MaintenanceEmployeeID",
                table: "MaintenanceEmployees",
                newName: "EmployeeID");

            migrationBuilder.RenameIndex(
                name: "IX_MaintenanceEmployees_MaintenanceEmployeeID",
                table: "MaintenanceEmployees",
                newName: "IX_MaintenanceEmployees_EmployeeID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenanceEmployees_Employee_EmployeeID",
                table: "MaintenanceEmployees",
                column: "EmployeeID",
                principalTable: "Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceEmployees_Employee_EmployeeID",
                table: "MaintenanceEmployees");

            migrationBuilder.RenameColumn(
                name: "EmployeeID",
                table: "MaintenanceEmployees",
                newName: "MaintenanceEmployeeID");

            migrationBuilder.RenameIndex(
                name: "IX_MaintenanceEmployees_EmployeeID",
                table: "MaintenanceEmployees",
                newName: "IX_MaintenanceEmployees_MaintenanceEmployeeID");

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenanceEmployees_Employee_MaintenanceEmployeeID",
                table: "MaintenanceEmployees",
                column: "MaintenanceEmployeeID",
                principalTable: "Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
