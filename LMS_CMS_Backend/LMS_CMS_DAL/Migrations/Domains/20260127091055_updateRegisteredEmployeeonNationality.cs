using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class updateRegisteredEmployeeonNationality : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // حذف الأعمدة القديمة
            migrationBuilder.DropColumn(
                name: "Nationality",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "RegisteredEmployee");

            // إضافة الأعمدة الجديدة
            migrationBuilder.AddColumn<string>(
                name: "Nationality",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Gender",
                table: "RegisteredEmployee",
                type: "bit",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {   
            migrationBuilder.DropColumn(
                name: "Nationality",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "RegisteredEmployee");

            migrationBuilder.AddColumn<long>(
                name: "Nationality",
                table: "RegisteredEmployee",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: true);
        }

    }
}
