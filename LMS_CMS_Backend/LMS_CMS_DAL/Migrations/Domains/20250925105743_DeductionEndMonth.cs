using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class DeductionEndMonth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Drop the old column first
            migrationBuilder.DropColumn(
                name: "DeductionStartMonth",
                table: "Loans");

            // 2. Add new integer columns
            migrationBuilder.AddColumn<int>(
                name: "DeductionStartMonth",
                table: "Loans",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DeductionEndMonth",
                table: "Loans",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DeductionEndYear",
                table: "Loans",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DeductionStartYear",
                table: "Loans",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove new int columns
            migrationBuilder.DropColumn(
                name: "DeductionStartMonth",
                table: "Loans");

            migrationBuilder.DropColumn(
                name: "DeductionEndMonth",
                table: "Loans");

            migrationBuilder.DropColumn(
                name: "DeductionEndYear",
                table: "Loans");

            migrationBuilder.DropColumn(
                name: "DeductionStartYear",
                table: "Loans");

            // Add old DateOnly column back
            migrationBuilder.AddColumn<DateOnly>(
                name: "DeductionStartMonth",
                table: "Loans",
                type: "date",
                nullable: false);
        }
    }
}
