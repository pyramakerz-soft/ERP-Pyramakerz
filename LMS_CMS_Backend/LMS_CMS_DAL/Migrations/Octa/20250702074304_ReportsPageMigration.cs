using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class ReportsPageMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES  
                (244, 'Inventory Reports', N'تقارير المخزون', 'Reports', N'التقارير', 76, 1),
                (245, 'Inventory Transaction Report', N'تقرير معاملات المخزون', 'Inventory Transaction', N'تقرير معاملات المخزون', 244, 1),
                (246, 'Sales Transaction Report', N'تقرير معاملات المبيعات', 'Sales Transaction', N'تقرير معاملات المبيعات', 244, 1),
                (247, 'Purchase Transaction Report', N'تقرير معاملات الشراء', 'Purchase Transaction', N'تقرير معاملات الشراء', 244, 1),
                (248, 'Inventory Transaction Detailed Report', N'تقرير مفصل لمعاملات المخزون', 'Inventory Transaction Detailed', N'تقرير مفصل لمعاملات المخزون', 244, 1),
                (249, 'Sales Transaction Detailed Report', N'تقرير مفصل عن معاملات المبيعات', 'Sales Transaction Detailed', N'تقرير مفصل عن معاملات المبيعات', 244, 1),
                (250, 'Purchase Transaction Detailed Report', N'تقرير مفصل عن معاملات الشراء', 'Purchase Transaction Detailed', N'تقرير مفصل عن معاملات الشراء', 244, 1);
            ");

            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES  
                (251, 'Student Names In Class', N'أسماء الطلاب في الفصل', 'Student Names In Class', N'أسماء الطلاب في الفصل', 206, 1), 
                (252, 'Student Information', N'معلومات الطالب', 'Student Information', N'معلومات الطالب', 206, 1), 
                (253, 'Proof Registration And Success Form', N'نموذج إثبات التسجيل والنجاح', 'Proof Registration And Success Form', N'نموذج إثبات التسجيل والنجاح', 206, 1), 
                (254, 'Proof Registration', N'تسجيل الإثبات', 'Proof Registration', N'تسجيل الإثبات', 206, 1), 
                (255, 'Students Information Form Report', N'نموذج تقرير معلومات الطلاب', 'Students Information Form', N'نموذج تقرير معلومات الطلاب', 206, 1), 
                (256, 'Academic Sequential Report', N'التقرير الأكاديمي المتسلسل', 'Academic Sequential', N'التقرير الأكاديمي المتسلسل', 206, 1), 
                (257, 'Transferred  From Kindergarten Report', N'تقرير النقل من الروضة', 'Transferred From Kindergarten', N'تقرير النقل من الروضة', 206, 1);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM Page WHERE ID BETWEEN 244 AND 250;");
            migrationBuilder.Sql("DELETE FROM Page WHERE ID BETWEEN 251 AND 257;");
        }
    }
}
