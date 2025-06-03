using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class StudentPage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page (ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                    (219, 'Subject Teacher', N'معلم المادة', 'Subject Teacher', N'معلم المادة', 11, 0),
                    (220, 'Subject Co-Teacher', N'معلم مساعد', 'Subject Co-Teacher', N'معلم مساعد', 11, 0),
                    (221, 'Student', N'طالب', 'Student', N'طالب', 11, 1),
                    (222, 'Create Student', N'إضافة طالب', 'Create Student', N'إضافة طالب', 11, 1),
                    (223, 'Edit Student', N'تعديل طالب', 'Edit Student', N'تعديل طالب', 11, 0),
                    (224, 'Student View', N'عرض الطالب', 'Student View', N'عرض الطالب', 11, 0);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID IN (219, 220, 221, 222, 223, 224);
            ");
        }
    }
}
