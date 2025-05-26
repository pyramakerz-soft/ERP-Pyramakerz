using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class ClassSubjectStudentPagesMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                    (216, 'Classroom Subject', N'مواد الفصل', 'Classroom Subject', N'مواد الفصل', 21, 0),
                    (217, 'Classroom Students', N'طلاب الفصل', 'Classroom Students', N'طلاب الفصل', 21, 0);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                 DELETE FROM Page WHERE ID IN (216, 217);
             ");
        }
    }
}
