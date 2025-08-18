using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class ClassroomInConduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "ClassroomID",
                table: "Conduct",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_Conduct_ClassroomID",
                table: "Conduct",
                column: "ClassroomID");

            migrationBuilder.AddForeignKey(
                name: "FK_Conduct_Classroom_ClassroomID",
                table: "Conduct",
                column: "ClassroomID",
                principalTable: "Classroom",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conduct_Classroom_ClassroomID",
                table: "Conduct");

            migrationBuilder.DropIndex(
                name: "IX_Conduct_ClassroomID",
                table: "Conduct");

            migrationBuilder.DropColumn(
                name: "ClassroomID",
                table: "Conduct");
        }
    }
}
