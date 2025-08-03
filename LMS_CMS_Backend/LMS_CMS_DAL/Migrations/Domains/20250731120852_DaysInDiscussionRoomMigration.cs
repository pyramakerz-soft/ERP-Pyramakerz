using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class DaysInDiscussionRoomMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Friday",
                table: "DiscussionRoom",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Monday",
                table: "DiscussionRoom",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Saturday",
                table: "DiscussionRoom",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Sunday",
                table: "DiscussionRoom",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Thursday",
                table: "DiscussionRoom",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Tuesday",
                table: "DiscussionRoom",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Wednesday",
                table: "DiscussionRoom",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Friday",
                table: "DiscussionRoom");

            migrationBuilder.DropColumn(
                name: "Monday",
                table: "DiscussionRoom");

            migrationBuilder.DropColumn(
                name: "Saturday",
                table: "DiscussionRoom");

            migrationBuilder.DropColumn(
                name: "Sunday",
                table: "DiscussionRoom");

            migrationBuilder.DropColumn(
                name: "Thursday",
                table: "DiscussionRoom");

            migrationBuilder.DropColumn(
                name: "Tuesday",
                table: "DiscussionRoom");

            migrationBuilder.DropColumn(
                name: "Wednesday",
                table: "DiscussionRoom");
        }
    }
}
