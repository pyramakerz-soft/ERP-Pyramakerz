using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class ChangeTypeOfMarkInSubjectMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<float>(
                name: "TotalMark",
                table: "Subject",
                type: "real",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<float>(
                name: "PassByDegree",
                table: "Subject",
                type: "real",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "IssuerId",
                table: "InventoryMaster",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TaxReceiverId",
                table: "InventoryMaster",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TaxIssuers",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ActivityCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BranchID = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Governate = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RegionCity = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Street = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BuildingNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PostalCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Floor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Room = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LandMark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AdditionalInfo = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_TaxIssuers", x => x.ID);
                    table.ForeignKey(
                        name: "FK_TaxIssuers_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TaxIssuers_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TaxIssuers_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "TaxReceivers",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActivityCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Governate = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RegionCity = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Street = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BuildingNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Floor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Room = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LandMark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AdditionalInfo = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_TaxReceivers", x => x.ID);
                    table.ForeignKey(
                        name: "FK_TaxReceivers_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TaxReceivers_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TaxReceivers_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryMaster_IssuerId",
                table: "InventoryMaster",
                column: "IssuerId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryMaster_TaxReceiverId",
                table: "InventoryMaster",
                column: "TaxReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxIssuers_DeletedByUserId",
                table: "TaxIssuers",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxIssuers_InsertedByUserId",
                table: "TaxIssuers",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxIssuers_UpdatedByUserId",
                table: "TaxIssuers",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxReceivers_DeletedByUserId",
                table: "TaxReceivers",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxReceivers_InsertedByUserId",
                table: "TaxReceivers",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxReceivers_UpdatedByUserId",
                table: "TaxReceivers",
                column: "UpdatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryMaster_TaxIssuers_IssuerId",
                table: "InventoryMaster",
                column: "IssuerId",
                principalTable: "TaxIssuers",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryMaster_TaxReceivers_TaxReceiverId",
                table: "InventoryMaster",
                column: "TaxReceiverId",
                principalTable: "TaxReceivers",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryMaster_TaxIssuers_IssuerId",
                table: "InventoryMaster");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryMaster_TaxReceivers_TaxReceiverId",
                table: "InventoryMaster");

            migrationBuilder.DropTable(
                name: "TaxIssuers");

            migrationBuilder.DropTable(
                name: "TaxReceivers");

            migrationBuilder.DropIndex(
                name: "IX_InventoryMaster_IssuerId",
                table: "InventoryMaster");

            migrationBuilder.DropIndex(
                name: "IX_InventoryMaster_TaxReceiverId",
                table: "InventoryMaster");

            migrationBuilder.DropColumn(
                name: "IssuerId",
                table: "InventoryMaster");

            migrationBuilder.DropColumn(
                name: "TaxReceiverId",
                table: "InventoryMaster");

            migrationBuilder.AlterColumn<int>(
                name: "TotalMark",
                table: "Subject",
                type: "int",
                nullable: false,
                oldClrType: typeof(float),
                oldType: "real");

            migrationBuilder.AlterColumn<int>(
                name: "PassByDegree",
                table: "Subject",
                type: "int",
                nullable: false,
                oldClrType: typeof(float),
                oldType: "real");
        }
    }
}
