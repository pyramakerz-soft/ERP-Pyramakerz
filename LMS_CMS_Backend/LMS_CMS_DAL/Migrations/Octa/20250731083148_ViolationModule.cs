using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class ViolationModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES  
                (280, 'Violation Module', N'وحدة المخالفات', 'Violation', N'المخالفات', NULL, 1),
                (281, 'Violation Master Data', N'بيانات المخالفات الأساسية', 'Master Data', N'البيانات الأساسية', 280, 1),
                (282, 'Violation Transaction', N'معالجة المخالفات', 'Transaction', N'المعالجة', 280, 1),
                (283, 'Violation Reports', N'تقارير المخالفات', 'Reports', N'التقارير', 280, 1),
                (284, 'violation', N'المخالفة', 'violation', N'المخالفة', 282, 1),
                (285, 'violation Report', N'تقرير المخالفة', 'violation', N'تقرير المخالفة', 283, 1);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID IN (285, 284, 283, 282, 281, 280);
            ");
        }
    }
}
