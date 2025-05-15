using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class RegistrationMasterPages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Insert master pages under Registration
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                (204, 'Registration Master Data', N'البيانات الرئيسية للتسجيل', 'Master Data', N'البيانات الرئيسية', 37, 1),
                (205, 'Registration Transaction', N'المعاملات الخاصة بالتسجيل', 'Transaction', N'المعاملات', 37, 1),
                (206, 'Registration Reports', N'تقارير التسجيل', 'Reports', N'التقارير', 37, 1);
            ");

            // Reassign pages under appropriate master pages
            migrationBuilder.Sql("UPDATE Page SET Page_ID = 204 WHERE ID IN (38, 40);");
            migrationBuilder.Sql("UPDATE Page SET Page_ID = 205 WHERE ID = 39 OR ID BETWEEN 41 AND 46;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Rollback changes
            migrationBuilder.Sql("DELETE FROM Page WHERE ID BETWEEN 204 AND 206;");
            migrationBuilder.Sql("UPDATE Page SET Page_ID = 37 WHERE ID IN (38, 39, 40, 41, 42, 43, 44, 45, 46);");
        }
    }
}
