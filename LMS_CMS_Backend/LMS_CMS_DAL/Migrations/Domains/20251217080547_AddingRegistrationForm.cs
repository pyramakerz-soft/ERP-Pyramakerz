using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class AddingRegistrationForm : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AuthorizeInvestigation",
                table: "Employee",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CurrentJob",
                table: "Employee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DidYouHaveAnyRelativeHere",
                table: "Employee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DoYouSpeakAnyOtherLanguages",
                table: "Employee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "EnterDate",
                table: "Employee",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "FromDate",
                table: "Employee",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "Employee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "HowDidYouFindUs",
                table: "Employee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "LastSalary",
                table: "Employee",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "Employee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PreviousExperiencePlace",
                table: "Employee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReasonforLeavingtheJob",
                table: "Employee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Signature",
                table: "Employee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ToDate",
                table: "Employee",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "YourLevelInEnglish",
                table: "Employee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "YourLevelInFrensh",
                table: "Employee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AuthorizeInvestigation",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "CurrentJob",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "DidYouHaveAnyRelativeHere",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "DoYouSpeakAnyOtherLanguages",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "EnterDate",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "FromDate",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "HowDidYouFindUs",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "LastSalary",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "PreviousExperiencePlace",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "ReasonforLeavingtheJob",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "Signature",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "ToDate",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "YourLevelInEnglish",
                table: "Employee");

            migrationBuilder.DropColumn(
                name: "YourLevelInFrensh",
                table: "Employee");
        }
    }
}
