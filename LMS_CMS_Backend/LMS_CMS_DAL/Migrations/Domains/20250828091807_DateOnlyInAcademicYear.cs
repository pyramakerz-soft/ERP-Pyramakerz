using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class DateOnlyInAcademicYear : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateOnly>(
                name: "DateTo",
                table: "AcademicYear",
                type: "date",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateOnly>(
                name: "DateFrom",
                table: "AcademicYear",
                type: "date",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "DateTo",
                table: "AcademicYear",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AlterColumn<string>(
                name: "DateFrom",
                table: "AcademicYear",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date");
        }
    }
}
