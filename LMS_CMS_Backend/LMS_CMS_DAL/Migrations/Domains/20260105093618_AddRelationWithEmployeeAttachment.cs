using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class AddRelationWithEmployeeAttachment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfileImageUrl",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RegisteredEmployeeID",
                table: "EmployeeAttachment",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAttachment_RegisteredEmployeeID",
                table: "EmployeeAttachment",
                column: "RegisteredEmployeeID");

            migrationBuilder.AddForeignKey(
                name: "FK_EmployeeAttachment_RegisteredEmployee_RegisteredEmployeeID",
                table: "EmployeeAttachment",
                column: "RegisteredEmployeeID",
                principalTable: "RegisteredEmployee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EmployeeAttachment_RegisteredEmployee_RegisteredEmployeeID",
                table: "EmployeeAttachment");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeAttachment_RegisteredEmployeeID",
                table: "EmployeeAttachment");

            migrationBuilder.DropColumn(
                name: "ProfileImageUrl",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "RegisteredEmployeeID",
                table: "EmployeeAttachment");
        }
    }
}
