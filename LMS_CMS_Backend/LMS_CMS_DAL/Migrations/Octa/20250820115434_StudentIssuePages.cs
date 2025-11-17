using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class StudentIssuePages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"

                UPDATE Page SET en_name = 'Social Worker Conduct', ar_name = N'سلوك الأخصائي الاجتماعي ', arDisplayName_name = N'سلوك', enDisplayName_name = 'Conduct', [Order] = 1 WHERE ID = 161;
                UPDATE Page SET en_name = 'Social Worker Student Issues', ar_name = N'قضايا الطلاب الأخصائي الاجتماعي', arDisplayName_name = N'قضايا الطلاب', enDisplayName_name = 'Student Issues', [Order] = 2 WHERE ID = 162;

                -- Social Worker Student Issues
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay, [Order]) VALUES
                (307, 'Student Issues Master Data', N'بيانات قضايا الطلاب  الأساسية', 'Master Data', N'البيانات الأساسية', 162, 1, 1),
                (308, 'Student Issues Transaction', N'معالجة قضايا الطلاب', 'Transaction', N'المعالجة',162, 1, 2),
                (309, 'Student Issues Reports', N'تقارير قضايا الطلاب', 'Reports', N'التقارير', 162, 1, 3);

                -- Social Worker Student Issues Master Data
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay, [Order]) VALUES
                (310, 'Issues Types', N'أنواع القضايا', 'Issues Types', N'أنواع القضايا', 307, 1, 1);

                -- Social Worker Student Issues Transaction
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay, [Order]) VALUES
                (311, 'Student Issues', N'قضايا الطلاب', 'Student Issues', N'قضايا الطلاب', 308, 1, 1);

                -- Social Worker Medals
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay, [Order]) VALUES
                (312, 'Medal Types', N'أنواع الميداليات', 'Medal Types', N'أنواع الميداليات', 163, 1, 1),
                (313, 'Certificate Types', N'أنواع الشهادات', 'Certificate Types', N'أنواع الشهادات',163, 1, 2),
                (314, 'Add Medal To Student', N'إضافة ميدالية للطالب', 'Add Medal To Student', N'إضافة ميدالية للطالب', 163, 1, 3),
                (315, 'Add Certificate To Student', N'إضافة شهادة للطالب', 'Add Certificate To Student', N'إضافة شهادة للطالب', 163, 1, 4);

                -- Social Worker Meeting
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay, [Order]) VALUES
                (316, 'Horizontal Meeting', N'اجتماع الموظفين', 'Horizontal Meeting', N'اجتماع الموظفين', 298, 1, 1),
                (317, 'Parent Meeting', N'اجتماع أولياء الأمور', 'Parent Meeting', N'اجتماع أولياء الأمور',298, 1, 2),
                (318, 'Appoinment', N'المواعيد', 'Appoinment', N'المواعيد', 298, 1, 3);

            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID BETWEEN 307 AND 318;
            ");
        }
    }
}
