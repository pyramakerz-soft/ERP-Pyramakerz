using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class violationmodule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EmployeeTypeViolation_EmployeeType_EmployeeTypeID",
                table: "EmployeeTypeViolation");

            migrationBuilder.DropForeignKey(
                name: "FK_EmployeeTypeViolation_Violation_ViolationID",
                table: "EmployeeTypeViolation");

            migrationBuilder.DropForeignKey(
                name: "FK_Violation_Employee_DeletedByUserId",
                table: "Violation");

            migrationBuilder.DropIndex(
                name: "IX_Violation_Name",
                table: "Violation");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Violation");

            migrationBuilder.RenameColumn(
                name: "ViolationID",
                table: "EmployeeTypeViolation",
                newName: "ViolationTypeID");

            migrationBuilder.RenameIndex(
                name: "IX_EmployeeTypeViolation_ViolationID",
                table: "EmployeeTypeViolation",
                newName: "IX_EmployeeTypeViolation_ViolationTypeID");

            migrationBuilder.AddColumn<string>(
                name: "Attach",
                table: "Violation",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "Date",
                table: "Violation",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<string>(
                name: "Details",
                table: "Violation",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "EmployeeID",
                table: "Violation",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "ViolationTypeID",
                table: "Violation",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateTable(
                name: "ViolationType",
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
                    table.PrimaryKey("PK_ViolationType", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ViolationType_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ViolationType_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ViolationType_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Violation_EmployeeID",
                table: "Violation",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Violation_ViolationTypeID",
                table: "Violation",
                column: "ViolationTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_ViolationType_DeletedByUserId",
                table: "ViolationType",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ViolationType_InsertedByUserId",
                table: "ViolationType",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ViolationType_Name",
                table: "ViolationType",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ViolationType_UpdatedByUserId",
                table: "ViolationType",
                column: "UpdatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_EmployeeTypeViolation_EmployeeType_EmployeeTypeID",
                table: "EmployeeTypeViolation",
                column: "EmployeeTypeID",
                principalTable: "EmployeeType",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EmployeeTypeViolation_ViolationType_ViolationTypeID",
                table: "EmployeeTypeViolation",
                column: "ViolationTypeID",
                principalTable: "ViolationType",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Violation_Employee_DeletedByUserId",
                table: "Violation",
                column: "DeletedByUserId",
                principalTable: "Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Violation_Employee_EmployeeID",
                table: "Violation",
                column: "EmployeeID",
                principalTable: "Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Violation_ViolationType_ViolationTypeID",
                table: "Violation",
                column: "ViolationTypeID",
                principalTable: "ViolationType",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EmployeeTypeViolation_EmployeeType_EmployeeTypeID",
                table: "EmployeeTypeViolation");

            migrationBuilder.DropForeignKey(
                name: "FK_EmployeeTypeViolation_ViolationType_ViolationTypeID",
                table: "EmployeeTypeViolation");

            migrationBuilder.DropForeignKey(
                name: "FK_Violation_Employee_DeletedByUserId",
                table: "Violation");

            migrationBuilder.DropForeignKey(
                name: "FK_Violation_Employee_EmployeeID",
                table: "Violation");

            migrationBuilder.DropForeignKey(
                name: "FK_Violation_ViolationType_ViolationTypeID",
                table: "Violation");

            migrationBuilder.DropTable(
                name: "ViolationType");

            migrationBuilder.DropIndex(
                name: "IX_Violation_EmployeeID",
                table: "Violation");

            migrationBuilder.DropIndex(
                name: "IX_Violation_ViolationTypeID",
                table: "Violation");

            migrationBuilder.DropColumn(
                name: "Attach",
                table: "Violation");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "Violation");

            migrationBuilder.DropColumn(
                name: "Details",
                table: "Violation");

            migrationBuilder.DropColumn(
                name: "EmployeeID",
                table: "Violation");

            migrationBuilder.DropColumn(
                name: "ViolationTypeID",
                table: "Violation");

            migrationBuilder.RenameColumn(
                name: "ViolationTypeID",
                table: "EmployeeTypeViolation",
                newName: "ViolationID");

            migrationBuilder.RenameIndex(
                name: "IX_EmployeeTypeViolation_ViolationTypeID",
                table: "EmployeeTypeViolation",
                newName: "IX_EmployeeTypeViolation_ViolationID");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Violation",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Violation_Name",
                table: "Violation",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_EmployeeTypeViolation_EmployeeType_EmployeeTypeID",
                table: "EmployeeTypeViolation",
                column: "EmployeeTypeID",
                principalTable: "EmployeeType",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_EmployeeTypeViolation_Violation_ViolationID",
                table: "EmployeeTypeViolation",
                column: "ViolationID",
                principalTable: "Violation",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Violation_Employee_DeletedByUserId",
                table: "Violation",
                column: "DeletedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");
        }
    }
}
