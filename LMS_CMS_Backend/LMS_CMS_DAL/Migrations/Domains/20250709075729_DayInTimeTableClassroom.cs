using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class DayInTimeTableClassroom : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Day",
                table: "TimeTableClassroom");

            migrationBuilder.AddColumn<long>(
                name: "DayId",
                table: "TimeTableClassroom",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TimeTableClassroom_DayId",
                table: "TimeTableClassroom",
                column: "DayId");

            migrationBuilder.AddForeignKey(
                name: "FK_TimeTableClassroom_Days_DayId",
                table: "TimeTableClassroom",
                column: "DayId",
                principalTable: "Days",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TimeTableClassroom_Days_DayId",
                table: "TimeTableClassroom");

            migrationBuilder.DropIndex(
                name: "IX_TimeTableClassroom_DayId",
                table: "TimeTableClassroom");

            migrationBuilder.DropColumn(
                name: "DayId",
                table: "TimeTableClassroom");

            migrationBuilder.AddColumn<string>(
                name: "Day",
                table: "TimeTableClassroom",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
