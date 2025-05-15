using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class MasterPages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Insert new master pages
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                (201, 'Accounting Master Data', N'البيانات الرئيسية للمحاسبة', 'Master Data', N'البيانات الرئيسية', 48, 1),
                (202, 'Accounting Transaction', N'المعاملات المحاسبية', 'Transaction', N'المعاملات', 48, 1),
                (203, 'Accounting Reports', N'تقارير المحاسبة', 'Reports', N'التقارير', 48, 1);
            ");

            // Update existing pages to reference these new master pages
            migrationBuilder.Sql("UPDATE Page SET Page_ID = 201 WHERE ID = 133;");
            migrationBuilder.Sql("UPDATE Page SET Page_ID = 201 WHERE ID BETWEEN 49 AND 65;");
            migrationBuilder.Sql("UPDATE Page SET Page_ID = 202 WHERE ID BETWEEN 66 AND 75;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Optional: reverse the changes here
            migrationBuilder.Sql("DELETE FROM Page WHERE ID BETWEEN 201 AND 203;");
            migrationBuilder.Sql("UPDATE Page SET Page_ID = 48 WHERE ID = 133;");
            migrationBuilder.Sql("UPDATE Page SET Page_ID = 48 WHERE ID BETWEEN 49 AND 65;");
            migrationBuilder.Sql("UPDATE Page SET Page_ID = 48 WHERE ID BETWEEN 66 AND 75;");
        }
    }
}
