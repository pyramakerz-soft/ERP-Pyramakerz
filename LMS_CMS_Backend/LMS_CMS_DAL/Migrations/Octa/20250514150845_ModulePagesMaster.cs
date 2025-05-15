using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class ModulePagesMaster : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                (158, 'HR Master Data', N'الموارد البشرية البيانات الرئيسية', 'Master Data', N'البيانات الرئيسية', 148, 1),
                (159, 'HR Transaction', N'الموارد البشرية المعاملات', 'Transaction', N'المعاملات', 148, 1),
                (160, 'HR Reports', N'الموارد البشرية التقارير', 'Reports', N'التقارير', 148, 1),

                (161, 'Social Worker Master Data', N'الأخصائي الاجتماعي البيانات الرئيسية', 'Master Data', N'البيانات الرئيسية', 149, 1),
                (162, 'Social Worker Transaction', N'الأخصائي الاجتماعي المعاملات', 'Transaction', N'المعاملات', 149, 1),
                (163, 'Social Worker Reports', N'الأخصائي الاجتماعي التقارير', 'Reports', N'التقارير', 149, 1),

                (164, 'Induction Master Data', N'التهيئة البيانات الرئيسية', 'Master Data', N'البيانات الرئيسية', 150, 1),
                (165, 'Induction Transaction', N'التهيئة المعاملات', 'Transaction', N'المعاملات', 150, 1),
                (166, 'Induction Reports', N'التهيئة التقارير', 'Reports', N'التقارير', 150, 1),

                (167, 'Archiving Master Data', N'الأرشفة البيانات الرئيسية', 'Master Data', N'البيانات الرئيسية', 151, 1),
                (168, 'Archiving Transaction', N'الأرشفة المعاملات', 'Transaction', N'المعاملات', 151, 1),
                (169, 'Archiving Reports', N'الأرشفة التقارير', 'Reports', N'التقارير', 151, 1),

                (170, 'SMS Master Data', N'الرسائل النصية البيانات الرئيسية', 'Master Data', N'البيانات الرئيسية', 152, 1),
                (171, 'SMS Transaction', N'الرسائل النصية المعاملات', 'Transaction', N'المعاملات', 152, 1),
                (172, 'SMS Reports', N'الرسائل النصية التقارير', 'Reports', N'التقارير', 152, 1),

                (173, 'Virtual Meetings Master Data', N'الاجتماعات الافتراضية البيانات الرئيسية', 'Master Data', N'البيانات الرئيسية', 153, 1),
                (174, 'Virtual Meetings Transaction', N'الاجتماعات الافتراضية المعاملات', 'Transaction', N'المعاملات', 153, 1),
                (175, 'Virtual Meetings Reports', N'الاجتماعات الافتراضية التقارير', 'Reports', N'التقارير', 153, 1),

                (176, 'Maintenance Master Data', N'الصيانة البيانات الرئيسية', 'Master Data', N'البيانات الرئيسية', 154, 1),
                (177, 'Maintenance Transaction', N'الصيانة المعاملات', 'Transaction', N'المعاملات', 154, 1),
                (178, 'Maintenance Reports', N'الصيانة التقارير', 'Reports', N'التقارير', 154, 1),

                (179, 'Communication Master Data', N'التواصل البيانات الرئيسية', 'Master Data', N'البيانات الرئيسية', 155, 1),
                (180, 'Communication Transaction', N'التواصل المعاملات', 'Transaction', N'المعاملات', 155, 1),
                (181, 'Communication Reports', N'التواصل التقارير', 'Reports', N'التقارير', 155, 1),

                (182, 'Shop Admin Master Data', N'إدارة المتجر البيانات الرئيسية', 'Master Data', N'البيانات الرئيسية', 156, 1),
                (183, 'Shop Admin Transaction', N'إدارة المتجر المعاملات', 'Transaction', N'المعاملات', 156, 1),
                (184, 'Shop Admin Reports', N'إدارة المتجر التقارير', 'Reports', N'التقارير', 156, 1)
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM Page WHERE ID BETWEEN 158 AND 184");
        }
    }
}
