using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class FailedStudentsEditMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DirectMarkFailedStudent");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DirectMarkFailedStudent",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    DirectMarkID = table.Column<long>(type: "bigint", nullable: false),
                    FailedStudentsID = table.Column<long>(type: "bigint", nullable: false),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    Degree = table.Column<float>(type: "real", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DirectMarkFailedStudent", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DirectMarkFailedStudent_DirectMark_DirectMarkID",
                        column: x => x.DirectMarkID,
                        principalTable: "DirectMark",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DirectMarkFailedStudent_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMarkFailedStudent_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMarkFailedStudent_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMarkFailedStudent_FailedStudents_FailedStudentsID",
                        column: x => x.FailedStudentsID,
                        principalTable: "FailedStudents",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkFailedStudent_DeletedByUserId",
                table: "DirectMarkFailedStudent",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkFailedStudent_DirectMarkID",
                table: "DirectMarkFailedStudent",
                column: "DirectMarkID");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkFailedStudent_FailedStudentsID",
                table: "DirectMarkFailedStudent",
                column: "FailedStudentsID");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkFailedStudent_InsertedByUserId",
                table: "DirectMarkFailedStudent",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkFailedStudent_UpdatedByUserId",
                table: "DirectMarkFailedStudent",
                column: "UpdatedByUserId");
        }
    }
}
