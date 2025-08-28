using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class ConnectionStateMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Maintenances_Employee_EmployeeID",
                table: "Maintenances");

            migrationBuilder.DropForeignKey(
                name: "FK_Maintenances_MaintenanceCompanies_CompanyID",
                table: "Maintenances");

            migrationBuilder.AddColumn<long>(
                name: "ConnectionStatusID",
                table: "Student",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "ConnectionStatusID",
                table: "Parent",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "ConnectionStatusID",
                table: "Employee",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ConnectionStatus",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConnectionStatus", x => x.ID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Student_ConnectionStatusID",
                table: "Student",
                column: "ConnectionStatusID");

            migrationBuilder.CreateIndex(
                name: "IX_Parent_ConnectionStatusID",
                table: "Parent",
                column: "ConnectionStatusID");

            migrationBuilder.CreateIndex(
                name: "IX_Employee_ConnectionStatusID",
                table: "Employee",
                column: "ConnectionStatusID");

            migrationBuilder.AddForeignKey(
                name: "FK_Employee_ConnectionStatus_ConnectionStatusID",
                table: "Employee",
                column: "ConnectionStatusID",
                principalTable: "ConnectionStatus",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Maintenances_Employee_EmployeeID",
                table: "Maintenances",
                column: "EmployeeID",
                principalTable: "Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Maintenances_MaintenanceCompanies_CompanyID",
                table: "Maintenances",
                column: "CompanyID",
                principalTable: "MaintenanceCompanies",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Parent_ConnectionStatus_ConnectionStatusID",
                table: "Parent",
                column: "ConnectionStatusID",
                principalTable: "ConnectionStatus",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Student_ConnectionStatus_ConnectionStatusID",
                table: "Student",
                column: "ConnectionStatusID",
                principalTable: "ConnectionStatus",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employee_ConnectionStatus_ConnectionStatusID",
                table: "Employee");

            migrationBuilder.DropForeignKey(
                name: "FK_Maintenances_Employee_EmployeeID",
                table: "Maintenances");

            migrationBuilder.DropForeignKey(
                name: "FK_Maintenances_MaintenanceCompanies_CompanyID",
                table: "Maintenances");

            migrationBuilder.DropForeignKey(
                name: "FK_Parent_ConnectionStatus_ConnectionStatusID",
                table: "Parent");

            migrationBuilder.DropForeignKey(
                name: "FK_Student_ConnectionStatus_ConnectionStatusID",
                table: "Student");

            migrationBuilder.DropTable(
                name: "ConnectionStatus");

            migrationBuilder.DropIndex(
                name: "IX_Student_ConnectionStatusID",
                table: "Student");

            migrationBuilder.DropIndex(
                name: "IX_Parent_ConnectionStatusID",
                table: "Parent");

            migrationBuilder.DropIndex(
                name: "IX_Employee_ConnectionStatusID",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "ConnectionStatusID",
                table: "Student");

            migrationBuilder.DropColumn(
                name: "ConnectionStatusID",
                table: "Parent");

            migrationBuilder.DropColumn(
                name: "ConnectionStatusID",
                table: "Employee");

            migrationBuilder.AddForeignKey(
                name: "FK_Maintenances_Employee_EmployeeID",
                table: "Maintenances",
                column: "EmployeeID",
                principalTable: "Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Maintenances_MaintenanceCompanies_CompanyID",
                table: "Maintenances",
                column: "CompanyID",
                principalTable: "MaintenanceCompanies",
                principalColumn: "ID",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
