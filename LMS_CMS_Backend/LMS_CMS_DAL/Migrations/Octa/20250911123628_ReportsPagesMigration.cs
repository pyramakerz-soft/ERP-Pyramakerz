using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class ReportsPagesMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES 
                    (349, 'Account Statement Report', N'تقرير كشف الحساب', 'Account Statement', N'كشف الحساب', 203, 1),
                    (350, 'Account Subledger Report', N'تقرير دفتر الأستاذ الفرعي للحسابات', 'Account Subledger', N'دفتر الأستاذ الفرعي للحسابات', 203, 1),
                    (351, 'Assignment Report', N'تقرير الاختبار', 'Assignment Report', N'تقرير الاختبار', 34, 1);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
               DELETE FROM Page WHERE ID IN (349,350,351);
            ");
        }
    }
}
