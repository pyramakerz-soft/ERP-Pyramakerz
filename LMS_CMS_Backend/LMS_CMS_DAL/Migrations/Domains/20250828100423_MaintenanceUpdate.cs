using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class MaintenanceUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceEmployees_Employee_EmployeeID",
                table: "MaintenanceEmployees");

            migrationBuilder.DropForeignKey(
                name: "FK_Maintenances_Employee_EmployeeID",
                table: "Maintenances");

            migrationBuilder.RenameColumn(
                name: "EmployeeID",
                table: "Maintenances",
                newName: "MaintenanceEmployeeID");

            migrationBuilder.RenameIndex(
                name: "IX_Maintenances_EmployeeID",
                table: "Maintenances",
                newName: "IX_Maintenances_MaintenanceEmployeeID");

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

            migrationBuilder.AddForeignKey(
                name: "FK_Maintenances_MaintenanceEmployees_MaintenanceEmployeeID",
                table: "Maintenances",
                column: "MaintenanceEmployeeID",
                principalTable: "MaintenanceEmployees",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceEmployees_Employee_MaintenanceEmployeeID",
                table: "MaintenanceEmployees");

            migrationBuilder.DropForeignKey(
                name: "FK_Maintenances_MaintenanceEmployees_MaintenanceEmployeeID",
                table: "Maintenances");

            migrationBuilder.RenameColumn(
                name: "MaintenanceEmployeeID",
                table: "Maintenances",
                newName: "EmployeeID");

            migrationBuilder.RenameIndex(
                name: "IX_Maintenances_MaintenanceEmployeeID",
                table: "Maintenances",
                newName: "IX_Maintenances_EmployeeID");

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

            migrationBuilder.AddForeignKey(
                name: "FK_Maintenances_Employee_EmployeeID",
                table: "Maintenances",
                column: "EmployeeID",
                principalTable: "Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
