using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class InsertInventoryAndAccountingPagesMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET enDisplayName_name = 'Hygiene Medical Form' WHERE ID = 115;
            ");

            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES  
                (261, 'Item Card Report', N'تقرير بطاقة العنصر', 'Item Card', N'بطاقة العنصر', 244, 1),
                (262, 'Item Card Report With Average', N'تقرير بطاقة العنصر مع المتوسط', 'Item Card With Average', N'بطاقة العنصر مع المتوسط', 244, 1),
                (263, 'Average Cost Calculation', N'حساب متوسط التكلفة', 'Average Cost Calculation', N'حساب متوسط التكلفة', 244, 1),
                (264, 'Accounting Configuration', N'إعدادات المحاسبة', 'Accounting Configuration', N'إعدادات المحاسبة', 201, 1),
                (265, 'Accounting Constraints Report', N'تقرير القيود المحاسبية المالية', 'Accounting Constraints', N'القيود المحاسبية', 203, 1);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET enDisplayName_name = 'Hygiene Form Medical Report' WHERE ID = 115;
            ");

            migrationBuilder.Sql("DELETE FROM Page WHERE ID BETWEEN 261 AND 265;");
        }
    }
}
