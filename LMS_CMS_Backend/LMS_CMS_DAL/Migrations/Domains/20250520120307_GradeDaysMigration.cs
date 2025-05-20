using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class GradeDaysMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FRI",
                table: "Grade",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MON",
                table: "Grade",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SAT",
                table: "Grade",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SUN",
                table: "Grade",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "THRU",
                table: "Grade",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TUS",
                table: "Grade",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WED",
                table: "Grade",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FRI",
                table: "Grade");

            migrationBuilder.DropColumn(
                name: "MON",
                table: "Grade");

            migrationBuilder.DropColumn(
                name: "SAT",
                table: "Grade");

            migrationBuilder.DropColumn(
                name: "SUN",
                table: "Grade");

            migrationBuilder.DropColumn(
                name: "THRU",
                table: "Grade");

            migrationBuilder.DropColumn(
                name: "TUS",
                table: "Grade");

            migrationBuilder.DropColumn(
                name: "WED",
                table: "Grade");
        }
    }
}
