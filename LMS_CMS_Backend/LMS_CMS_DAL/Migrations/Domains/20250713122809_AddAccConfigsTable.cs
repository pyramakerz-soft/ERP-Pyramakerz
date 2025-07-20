using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class AddAccConfigsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AccountingConfigs",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SalesID = table.Column<long>(type: "bigint", nullable: true),
                    SalesReturnID = table.Column<long>(type: "bigint", nullable: true),
                    PurchaseID = table.Column<long>(type: "bigint", nullable: true),
                    PurchaseReturnID = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountingConfigs", x => x.ID);
                    table.ForeignKey(
                        name: "FK_AccountingConfigs_AccountingTreeCharts_PurchaseID",
                        column: x => x.PurchaseID,
                        principalTable: "AccountingTreeCharts",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AccountingConfigs_AccountingTreeCharts_PurchaseReturnID",
                        column: x => x.PurchaseReturnID,
                        principalTable: "AccountingTreeCharts",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AccountingConfigs_AccountingTreeCharts_SalesID",
                        column: x => x.SalesID,
                        principalTable: "AccountingTreeCharts",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AccountingConfigs_AccountingTreeCharts_SalesReturnID",
                        column: x => x.SalesReturnID,
                        principalTable: "AccountingTreeCharts",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccountingConfigs_PurchaseID",
                table: "AccountingConfigs",
                column: "PurchaseID");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingConfigs_PurchaseReturnID",
                table: "AccountingConfigs",
                column: "PurchaseReturnID");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingConfigs_SalesID",
                table: "AccountingConfigs",
                column: "SalesID");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingConfigs_SalesReturnID",
                table: "AccountingConfigs",
                column: "SalesReturnID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccountingConfigs");
        }
    }
}
