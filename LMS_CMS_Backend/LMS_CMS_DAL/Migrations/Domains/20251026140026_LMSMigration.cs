using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class LMSMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "UpgradeToID",
                table: "Grade",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "SummerCourseDateFrom",
                table: "AcademicYear",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "SummerCourseDateTo",
                table: "AcademicYear",
                type: "date",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Grade_UpgradeToID",
                table: "Grade",
                column: "UpgradeToID");

            migrationBuilder.AddForeignKey(
                name: "FK_Grade_Grade_UpgradeToID",
                table: "Grade",
                column: "UpgradeToID",
                principalTable: "Grade",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Grade_Grade_UpgradeToID",
                table: "Grade");

            migrationBuilder.DropIndex(
                name: "IX_Grade_UpgradeToID",
                table: "Grade");

            migrationBuilder.DropColumn(
                name: "UpgradeToID",
                table: "Grade");

            migrationBuilder.DropColumn(
                name: "SummerCourseDateFrom",
                table: "AcademicYear");

            migrationBuilder.DropColumn(
                name: "SummerCourseDateTo",
                table: "AcademicYear");
        }
    }
}
