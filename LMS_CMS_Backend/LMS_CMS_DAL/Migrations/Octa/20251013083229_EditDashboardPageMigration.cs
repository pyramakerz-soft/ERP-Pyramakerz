using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class EditDashboardPageMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET arDisplayName_name = N'لوحة التحكم' WHERE ID = 370;
            ");
            migrationBuilder.Sql(@"
                UPDATE Page SET [Order] = 1 WHERE ID = 370;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET arDisplayName_name = N'لوحة القيادة' WHERE ID = 370;
            ");
            migrationBuilder.Sql(@"
                UPDATE Page SET [Order] = 1 WHERE ID = 370;
            ");
        }
    }
}
