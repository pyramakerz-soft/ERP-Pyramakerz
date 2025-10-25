using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class DailyPerformanceAndEvaluationReportMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@" 
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                (323, 'Student Daily Performance Report', N'تقرير الأداء اليومي للطالب', 'Student Daily Performance', N'الأداء اليومي للطالب', 194, 1),
                (324, 'Classroom Daily Performance Report', N'تقرير الأداء اليومي للفصل الدراسي', 'Classroom Daily Performance', N'الأداء اليومي للفصل الدراسي', 194, 1),
                (325, 'Employee Evaluation Report', N'تقرير تقييم الموظفين', 'Reports', N'التقارير', 137, 1),
                (326, 'Evaluation Report', N'تقرير التقييم', 'Evaluation', N'التقييم', 325, 1),
                (327, 'Teacher Evaluation Report', N'تقرير تقييم المعلم', 'Teacher Evaluation', N'تقييم المعلم', 325, 1);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID In (323, 324, 325, 326, 327);
            ");
        }
    }
}
