using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class SchoolInConductType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "SchoolID",
                table: "ConductType",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_ConductType_SchoolID",
                table: "ConductType",
                column: "SchoolID");

            migrationBuilder.AddForeignKey(
                name: "FK_ConductType_School_SchoolID",
                table: "ConductType",
                column: "SchoolID",
                principalTable: "School",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConductType_School_SchoolID",
                table: "ConductType");

            migrationBuilder.DropIndex(
                name: "IX_ConductType_SchoolID",
                table: "ConductType");

            migrationBuilder.DropColumn(
                name: "SchoolID",
                table: "ConductType");
        }
    }
}
