using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class SocialWorkerPagesMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@" 
            INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES 
                (333, 'Social Worker Reports', N'تقارير الأخصائي الاجتماعي', 'Reports', N'تقارير', 149, 1),
                (334, 'Conducts Report', N'تقرير السلوك', 'Conduct', N'السلوك', 333, 1),
                (335, 'Attendance Report', N'تقرير الحضور', 'Attendance', N'الحضور', 333, 1),
                (336, 'Student Issue Report', N'تقرير مشكلة الطالب', 'Student Issue', N'مشكلة الطالب', 333, 1),
                (337, 'Certificate To Student Report', N'شهادة لتقرير الطالب', 'Certificate To Student', N'شهادة لتقرير الطالب', 333, 1),
                (338, 'Medal To Student Report', N'ميدالية لتقرير الطالب', 'Medal To Student', N'ميدالية لتقرير الطالب', 333, 1),
                (339, 'Account Balance Report', N'تقرير رصيد الحساب', 'Account Balance', N'رصيد الحساب',203 , 1);
            ");

            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 301;
            ");

            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 309;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID In (333,334,335,336,337,338,339);
            "); 
        }
    }
}
