using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class LocationPage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                    (352, 'Salary Configuration', N'إعدادات الرواتب', 'Salary Configuration', N'إعدادات الرواتب', 158, 1),
                    (353, 'Location', N'الموقع', 'Location', N'الموقع', 158, 1);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
               DELETE FROM Page WHERE ID IN (352,353);
            ");
        }
    }
}
