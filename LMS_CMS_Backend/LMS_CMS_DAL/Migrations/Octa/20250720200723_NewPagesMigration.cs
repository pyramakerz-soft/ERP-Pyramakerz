using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class NewPagesMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES  
                (266, 'Registered Employee', N'الموظفين المسجلين', 'Registered Employee', N'الموظفين المسجلين', 11, 1),
                (267, 'Discussion Room', N'غرفة المناقشة', 'Discussion Room', N'غرفة المناقشة', 34, 1),
                (268, 'Announcement', N'إعلان', 'Announcement', N'إعلان', 11, 1);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM Page WHERE ID BETWEEN 266 AND 268;");
        }
    }
}
