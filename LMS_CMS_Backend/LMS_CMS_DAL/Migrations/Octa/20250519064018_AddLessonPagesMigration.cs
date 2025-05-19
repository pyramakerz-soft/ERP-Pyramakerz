using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class AddLessonPagesMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                (213, 'Lesson Activity', N'موارد الدروس', 'Lesson Activity', N'موارد الدروس', 200, 0),
                (214, 'Lesson Resource', N'أنشطة الدروس', 'Lesson Resource', N'أنشطة الدروس', 200, 0);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID IN (213, 214);
            ");
        }
    }
}
