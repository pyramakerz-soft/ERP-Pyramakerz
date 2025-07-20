using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class AssignmentStudentUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET Page_ID = 34 WHERE ID = 258;
                UPDATE Page SET Page_ID = 34 WHERE ID = 259;
                UPDATE Page SET Page_ID = 34 WHERE ID = 260;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET Page_ID = 189 WHERE ID = 258;
                UPDATE Page SET Page_ID = 189 WHERE ID = 259;
                UPDATE Page SET Page_ID = 189 WHERE ID = 260;
            ");
        }
    }
}
