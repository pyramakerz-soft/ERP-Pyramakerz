using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class AddAccountingConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AccountingConfigurations",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SalesID = table.Column<long>(type: "bigint", nullable: true),
                    SalesReturnID = table.Column<long>(type: "bigint", nullable: true),
                    PurchaseID = table.Column<long>(type: "bigint", nullable: true),
                    PurchaseReturnID = table.Column<long>(type: "bigint", nullable: true),
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
                    table.PrimaryKey("PK_AccountingConfigurations", x => x.ID);
                    table.ForeignKey(
                        name: "FK_AccountingConfigurations_AccountingTreeCharts_PurchaseID",
                        column: x => x.PurchaseID,
                        principalTable: "AccountingTreeCharts",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AccountingConfigurations_AccountingTreeCharts_PurchaseReturnID",
                        column: x => x.PurchaseReturnID,
                        principalTable: "AccountingTreeCharts",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AccountingConfigurations_AccountingTreeCharts_SalesID",
                        column: x => x.SalesID,
                        principalTable: "AccountingTreeCharts",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AccountingConfigurations_AccountingTreeCharts_SalesReturnID",
                        column: x => x.SalesReturnID,
                        principalTable: "AccountingTreeCharts",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AccountingConfigurations_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AccountingConfigurations_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AccountingConfigurations_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccountingConfigurations_DeletedByUserId",
                table: "AccountingConfigurations",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingConfigurations_InsertedByUserId",
                table: "AccountingConfigurations",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingConfigurations_PurchaseID",
                table: "AccountingConfigurations",
                column: "PurchaseID");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingConfigurations_PurchaseReturnID",
                table: "AccountingConfigurations",
                column: "PurchaseReturnID");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingConfigurations_SalesID",
                table: "AccountingConfigurations",
                column: "SalesID");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingConfigurations_SalesReturnID",
                table: "AccountingConfigurations",
                column: "SalesReturnID");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingConfigurations_UpdatedByUserId",
                table: "AccountingConfigurations",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccountingConfigurations");
        }
    }
}
