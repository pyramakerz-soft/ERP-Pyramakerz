using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class AssignmentStudent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES  
                (258, 'Assignment View', N'عرض الواجب', 'Assignment View', N'عرض الواجب', 189, 0),
                (259, 'Assignment Student', N'تقييم الطالب في الواجب', 'Assignment Student', N'تقييم الطالب في الواجب', 189, 0),
                (260, 'Assignment Student Answer', N'إجابة الطالب على الواجب', 'Assignment Student Answer', N'إجابة الطالب على الواجب', 189, 0);
            ");
        }
        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM Page WHERE ID BETWEEN 258 AND 260;");
        }
    }
}
