using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class RemedialTimeTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES  
                (286, 'Remedial', N'التقوية', 'Remedial', N'التقوية', 34, 1),
                (287, 'Remedial Classes', N'صفوف التقوية', 'Classes', N'الصفوف', 286, 1),
                (288, 'Remedial TimeTable', N'جدول حصص التقوية', 'TimeTable', N'الجدول الزمني', 286, 1);
            ");

            migrationBuilder.Sql(@"
                UPDATE Page SET Page_ID = 11 WHERE ID IN (278, 279);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID IN (288, 287, 286);
            ");

            migrationBuilder.Sql(@"
                UPDATE Page SET Page_ID = 34 WHERE ID IN (278, 279);
            ");
        }
    }
}
