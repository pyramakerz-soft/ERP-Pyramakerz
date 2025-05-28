using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class StudentClassMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StudentClassroom_Classroom_ClassroomID",
                table: "StudentClassroom");

            migrationBuilder.DropIndex(
                name: "IX_StudentClassroom_ClassroomID",
                table: "StudentClassroom");

            migrationBuilder.DropColumn(
                name: "ClassroomID",
                table: "StudentClassroom");

            migrationBuilder.CreateIndex(
                name: "IX_StudentClassroom_ClassID",
                table: "StudentClassroom",
                column: "ClassID");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentClassroom_Classroom_ClassID",
                table: "StudentClassroom",
                column: "ClassID",
                principalTable: "Classroom",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StudentClassroom_Classroom_ClassID",
                table: "StudentClassroom");

            migrationBuilder.DropIndex(
                name: "IX_StudentClassroom_ClassID",
                table: "StudentClassroom");

            migrationBuilder.AddColumn<long>(
                name: "ClassroomID",
                table: "StudentClassroom",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_StudentClassroom_ClassroomID",
                table: "StudentClassroom",
                column: "ClassroomID");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentClassroom_Classroom_ClassroomID",
                table: "StudentClassroom",
                column: "ClassroomID",
                principalTable: "Classroom",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
