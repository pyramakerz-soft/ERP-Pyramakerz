using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class SocialWorker : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET en_name = 'Conduct', ar_name = N'سلوك', arDisplayName_name = N'سلوك', enDisplayName_name = 'Conduct', [Order] = 1 WHERE ID = 161;
                UPDATE Page SET en_name = 'Student Issues', ar_name = N'قضايا الطلاب', arDisplayName_name = N'قضايا الطلاب', enDisplayName_name = 'Student Issues', [Order] = 2 WHERE ID = 162;
                UPDATE Page SET en_name = 'Social Worker Medals', ar_name = N'ميداليات الأخصائي الاجتماعي', arDisplayName_name = N'الميداليات', enDisplayName_name = 'Medals', [Order] = 3 WHERE ID = 163;

                -- Social Worker Meetings
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay, [Order]) VALUES
                (298, 'Social Worker Meetings', N'اجتماعات الأخصائي الاجتماعي', 'Meetings', N'الاجتماعات', 149, 1, 4),

                -- Conduct Section
                (299, 'Conduct Master Data', N'بيانات المخالفات الأخصائي الاجتماعي  الأساسية', 'Master Data', N'البيانات الأساسية', 161, 1, 1),
                (300, 'Conduct Transaction', N'معالجة الأخصائي الاجتماعي المخالفات', 'Transaction', N'المعالجة', 161, 1, 2),
                (301, 'Conduct Reports', N'تقارير الأخصائي الاجتماعي المخالفات', 'Reports', N'التقارير', 161, 1, 3),

                -- Conduct Master Data Children
                (302, 'Conduct Level', N'مستويات المخالفات', 'Conduct Level', N'مستويات المخالفات', 299, 1, 1),
                (303, 'Conduct Types', N'أنواع المخالفات', 'Conduct Types', N'أنواع المخالفات', 299, 1, 2),
                (304, 'Procedure Types', N'أنواع الإجراءات', 'Procedure Types', N'أنواع الإجراءات', 299, 1, 3),

                -- Conduct Transaction Children
                (305, 'Conducts', N'المخالفات', 'Conducts', N'المخالفات', 300, 1, 1),
                (306, 'Attendance', N'الحضور', 'Attendance', N'الحضور', 300, 1, 2);
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET en_name = 'Social Worker Master Data', ar_name = N'الأخصائي الاجتماعي البيانات الرئيسية', arDisplayName_name = N'البيانات الرئيسية', enDisplayName_name = 'Master Data', [Order] = 1 WHERE ID = 161;
                UPDATE Page SET en_name = 'Social Worker Transaction', ar_name = N'الأخصائي الاجتماعي المعاملات', arDisplayName_name = N'المعاملات', enDisplayName_name = 'Transaction', [Order] = 2 WHERE ID = 162;
                UPDATE Page SET en_name = 'Social Worker Reports', ar_name = N'الأخصائي الاجتماعي التقارير', arDisplayName_name = N'التقارير', enDisplayName_name = 'Reports', [Order] = 3 WHERE ID = 163;

                DELETE FROM Page WHERE ID BETWEEN 298 AND 306;
            ");
        }
    }
}
