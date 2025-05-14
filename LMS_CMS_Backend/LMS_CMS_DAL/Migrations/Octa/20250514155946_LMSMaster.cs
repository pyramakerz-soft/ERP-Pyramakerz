using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class LMSMaster : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES  
                (185, 'Daily Performance', N'الأداء اليومي', 'Daily Performance', N'الأداء اليومي', NULL, 1),
                (186, 'Weekly plan', N'الخطة الأسبوعية', 'Weekly plan', N'الخطة الأسبوعية', NULL, 1),
                (187, 'Lesson Live', N'الدروس المباشرة', 'Lesson Live', N'الدروس المباشرة', NULL, 1),
                (188, 'Question Bank', N'بنك الأسئلة', 'Question Bank', N'بنك الأسئلة', NULL, 1),
                (189, 'Assignment', N'الواجبات', 'Assignment', N'الواجبات', NULL, 1),
                (190, 'Weight Types', N'أنواع الأوزان', 'Weight Types', N'أنواع الأوزان', NULL, 1),
                (191, 'Certificate', N'الشهادات', 'Certificate', N'الشهادات', NULL, 1)
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM Page WHERE ID BETWEEN 185 AND 191");
        }
    }
}
