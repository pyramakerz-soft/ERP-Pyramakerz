using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class FailedStudentsDirectMarkMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<long>(
                name: "SubjectWeightTypeID",
                table: "DirectMark",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.CreateTable(
                name: "DirectMarkFailedStudent",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Degree = table.Column<float>(type: "real", nullable: true),
                    DirectMarkID = table.Column<long>(type: "bigint", nullable: false),
                    FailedStudentsID = table.Column<long>(type: "bigint", nullable: false),
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DirectMarkFailedStudent");

            migrationBuilder.AlterColumn<long>(
                name: "SubjectWeightTypeID",
                table: "DirectMark",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);
        }
    }
}
