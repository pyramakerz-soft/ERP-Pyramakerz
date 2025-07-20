using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class DutyTableEmployee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Duty_Employee_DeletedByUserId",
                table: "Duty");

            migrationBuilder.AddColumn<long>(
                name: "TeacherID",
                table: "Duty",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_Duty_TeacherID",
                table: "Duty",
                column: "TeacherID");

            migrationBuilder.AddForeignKey(
                name: "FK_Duty_Employee_DeletedByUserId",
                table: "Duty",
                column: "DeletedByUserId",
                principalTable: "Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Duty_Employee_TeacherID",
                table: "Duty",
                column: "TeacherID",
                principalTable: "Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Duty_Employee_DeletedByUserId",
                table: "Duty");

            migrationBuilder.DropForeignKey(
                name: "FK_Duty_Employee_TeacherID",
                table: "Duty");

            migrationBuilder.DropIndex(
                name: "IX_Duty_TeacherID",
                table: "Duty");

            migrationBuilder.DropColumn(
                name: "TeacherID",
                table: "Duty");

            migrationBuilder.AddForeignKey(
                name: "FK_Duty_Employee_DeletedByUserId",
                table: "Duty",
                column: "DeletedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");
        }
    }
}
