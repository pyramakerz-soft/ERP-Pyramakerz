using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class LMSDailyPerformance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES  
                (192, 'Daily Performance Master Data', N'البيانات الرئيسية للأداء اليومي', 'Daily Performance Master Data', N'البيانات الرئيسية', 185, 1),
                (193, 'Daily Performance Transaction', N'معاملات الأداء اليومي', 'Daily Performance Transaction', N'المعاملات', 185, 1),
                (194, 'Daily Performance Reports', N'تقارير الأداء اليومي', 'Daily Performance Reports', N'التقارير', 185, 1),

                (195, 'Enter Daily Performance', N'إدخال الأداء اليومي', 'Enter Daily Performance', N'إدخال الأداء اليومي', 193, 1),
                (196, 'Student Medal', N'ميداليات الطلاب', 'Medal', N'الميداليات', 193, 1),

                (197, 'Medal', N'الميداليات', 'Medal', N'الميداليات', 192, 1),

                (198, 'Lesson Resources Types', N'أنواع موارد الدروس', 'Lesson Resources Types', N'أنواع موارد الدروس', 186, 1),
                (199, 'Lesson Activity Types', N'أنواع أنشطة الدروس', 'Lesson Activity Types', N'أنواع أنشطة الدروس', 186, 1),
                (200, 'Lessons', N'الدروس', 'Lessons', N'الدروس', 186, 1)
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM Page WHERE ID BETWEEN 192 AND 200");
        }
    }
}
