using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class SchooolInStocking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "SchoolId",
                table: "Stocking",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "SchoolPCId",
                table: "Stocking",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Stocking_SchoolId",
                table: "Stocking",
                column: "SchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_Stocking_SchoolPCId",
                table: "Stocking",
                column: "SchoolPCId");

            migrationBuilder.AddForeignKey(
                name: "FK_Stocking_SchoolPCs_SchoolPCId",
                table: "Stocking",
                column: "SchoolPCId",
                principalTable: "SchoolPCs",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Stocking_School_SchoolId",
                table: "Stocking",
                column: "SchoolId",
                principalTable: "School",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Stocking_SchoolPCs_SchoolPCId",
                table: "Stocking");

            migrationBuilder.DropForeignKey(
                name: "FK_Stocking_School_SchoolId",
                table: "Stocking");

            migrationBuilder.DropIndex(
                name: "IX_Stocking_SchoolId",
                table: "Stocking");

            migrationBuilder.DropIndex(
                name: "IX_Stocking_SchoolPCId",
                table: "Stocking");

            migrationBuilder.DropColumn(
                name: "SchoolId",
                table: "Stocking");

            migrationBuilder.DropColumn(
                name: "SchoolPCId",
                table: "Stocking");
        }
    }
}
