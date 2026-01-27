using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class AddRelationWithTitle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PositionAppliedFor",
                table: "RegisteredEmployee");

            migrationBuilder.AddColumn<long>(
                name: "TitleID",
                table: "RegisteredEmployee",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RegisteredEmployee_TitleID",
                table: "RegisteredEmployee",
                column: "TitleID");

            migrationBuilder.AddForeignKey(
                name: "FK_RegisteredEmployee_Titles_TitleID",
                table: "RegisteredEmployee",
                column: "TitleID",
                principalTable: "Titles",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RegisteredEmployee_Titles_TitleID",
                table: "RegisteredEmployee");

            migrationBuilder.DropIndex(
                name: "IX_RegisteredEmployee_TitleID",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "TitleID",
                table: "RegisteredEmployee");

            migrationBuilder.AddColumn<string>(
                name: "PositionAppliedFor",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
