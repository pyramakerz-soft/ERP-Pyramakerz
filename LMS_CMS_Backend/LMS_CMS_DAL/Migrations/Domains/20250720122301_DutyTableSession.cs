using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class DutyTableSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Duty_TimeTableSubject_TimeTableSubjectID",
                table: "Duty");

            migrationBuilder.RenameColumn(
                name: "TimeTableSubjectID",
                table: "Duty",
                newName: "TimeTableSessionID");

            migrationBuilder.RenameIndex(
                name: "IX_Duty_TimeTableSubjectID",
                table: "Duty",
                newName: "IX_Duty_TimeTableSessionID");

            migrationBuilder.AddForeignKey(
                name: "FK_Duty_TimeTableSession_TimeTableSessionID",
                table: "Duty",
                column: "TimeTableSessionID",
                principalTable: "TimeTableSession",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Duty_TimeTableSession_TimeTableSessionID",
                table: "Duty");

            migrationBuilder.RenameColumn(
                name: "TimeTableSessionID",
                table: "Duty",
                newName: "TimeTableSubjectID");

            migrationBuilder.RenameIndex(
                name: "IX_Duty_TimeTableSessionID",
                table: "Duty",
                newName: "IX_Duty_TimeTableSubjectID");

            migrationBuilder.AddForeignKey(
                name: "FK_Duty_TimeTableSubject_TimeTableSubjectID",
                table: "Duty",
                column: "TimeTableSubjectID",
                principalTable: "TimeTableSubject",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
