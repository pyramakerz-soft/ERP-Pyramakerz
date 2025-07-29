using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class DiscussionRoomSchool : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "SchoolID",
                table: "DiscussionRoom",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionRoom_SchoolID",
                table: "DiscussionRoom",
                column: "SchoolID");

            migrationBuilder.AddForeignKey(
                name: "FK_DiscussionRoom_School_SchoolID",
                table: "DiscussionRoom",
                column: "SchoolID",
                principalTable: "School",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DiscussionRoom_School_SchoolID",
                table: "DiscussionRoom");

            migrationBuilder.DropIndex(
                name: "IX_DiscussionRoom_SchoolID",
                table: "DiscussionRoom");

            migrationBuilder.DropColumn(
                name: "SchoolID",
                table: "DiscussionRoom");
        }
    }
}
