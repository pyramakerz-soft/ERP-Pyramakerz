using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class bonus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bouns");

            migrationBuilder.DropTable(
                name: "BounsType");

            migrationBuilder.CreateTable(
                name: "BonusType",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BonusType", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Bonus",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    NumberOfBonusDays = table.Column<int>(type: "int", nullable: false),
                    Hours = table.Column<int>(type: "int", nullable: false),
                    Minutes = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<long>(type: "bigint", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmployeeID = table.Column<long>(type: "bigint", nullable: false),
                    BounsTypeID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_Bonus", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Bonus_BonusType_BounsTypeID",
                        column: x => x.BounsTypeID,
                        principalTable: "BonusType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bonus_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bonus_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bonus_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Bonus_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bonus_BounsTypeID",
                table: "Bonus",
                column: "BounsTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Bonus_DeletedByUserId",
                table: "Bonus",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Bonus_EmployeeID",
                table: "Bonus",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Bonus_InsertedByUserId",
                table: "Bonus",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Bonus_UpdatedByUserId",
                table: "Bonus",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bonus");

            migrationBuilder.DropTable(
                name: "BonusType");

            migrationBuilder.CreateTable(
                name: "BounsType",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BounsType", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Bouns",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BounsTypeID = table.Column<long>(type: "bigint", nullable: false),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    EmployeeID = table.Column<long>(type: "bigint", nullable: false),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    Amount = table.Column<long>(type: "bigint", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    Hours = table.Column<int>(type: "int", nullable: false),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true),
                    Minutes = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NumberOfBounsDays = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bouns", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Bouns_BounsType_BounsTypeID",
                        column: x => x.BounsTypeID,
                        principalTable: "BounsType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bouns_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bouns_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bouns_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Bouns_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bouns_BounsTypeID",
                table: "Bouns",
                column: "BounsTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Bouns_DeletedByUserId",
                table: "Bouns",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Bouns_EmployeeID",
                table: "Bouns",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Bouns_InsertedByUserId",
                table: "Bouns",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Bouns_UpdatedByUserId",
                table: "Bouns",
                column: "UpdatedByUserId");
        }
    }
}
