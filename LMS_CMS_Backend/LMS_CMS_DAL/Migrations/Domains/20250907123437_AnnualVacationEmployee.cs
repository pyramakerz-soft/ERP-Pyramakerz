using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class AnnualVacationEmployee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AnnualVacationEmployee",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Balance = table.Column<int>(type: "int", nullable: false),
                    EmployeeID = table.Column<long>(type: "bigint", nullable: false),
                    VacationTypesID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_AnnualVacationEmployee", x => x.ID);
                    table.ForeignKey(
                        name: "FK_AnnualVacationEmployee_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AnnualVacationEmployee_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AnnualVacationEmployee_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AnnualVacationEmployee_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AnnualVacationEmployee_VacationTypes_VacationTypesID",
                        column: x => x.VacationTypesID,
                        principalTable: "VacationTypes",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnnualVacationEmployee_DeletedByUserId",
                table: "AnnualVacationEmployee",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AnnualVacationEmployee_EmployeeID",
                table: "AnnualVacationEmployee",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_AnnualVacationEmployee_InsertedByUserId",
                table: "AnnualVacationEmployee",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AnnualVacationEmployee_UpdatedByUserId",
                table: "AnnualVacationEmployee",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AnnualVacationEmployee_VacationTypesID",
                table: "AnnualVacationEmployee",
                column: "VacationTypesID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnnualVacationEmployee");
        }
    }
}
