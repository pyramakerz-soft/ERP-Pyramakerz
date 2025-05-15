using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class ModulePages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES  
                (148, 'HR', N'الموارد البشرية', 'HR', N'الموارد البشرية', NULL, 1),
                (149, 'Social Worker', N'الأخصائي الاجتماعي', 'Social Worker', N'الأخصائي الاجتماعي', NULL, 1),
                (150, 'Induction', N'التهيئة', 'Induction', N'التهيئة', NULL, 1),
                (151, 'Archiving', N'الأرشفة', 'Archiving', N'الأرشفة', NULL, 1),
                (152, 'SMS', N'الرسائل النصية', 'SMS', N'الرسائل النصية', NULL, 1),
                (153, 'Virtual Meetings', N'الاجتماعات الافتراضية', 'Virtual Meetings', N'الاجتماعات الافتراضية', NULL, 1),
                (154, 'Maintenance', N'الصيانة', 'Maintenance', N'الصيانة', NULL, 1),
                (155, 'Communication', N'التواصل', 'Communication', N'التواصل', NULL, 1),
                (156, 'Shop Admin', N'إدارة المتجر', 'Shop Admin', N'إدارة المتجر', NULL, 1)
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID BETWEEN 148 AND 156
            ");
        }
    }
}
