using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class ZatcaAndEtaModulesMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES  
                (226, 'Zatca', N'هيئة الزكاة والضريبة والجمارك', 'Zatca', N'هيئة الزكاة والضريبة والجمارك', NULL, 1),
                (227, 'ETA', N'مصلحة الضرائب المصرية', 'ETA', N'مصلحة الضرائب المصرية', NULL, 1);
            ");

            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                (228, 'Zatca Master Data', N'البيانات الرئيسية للهيئة', 'Master Data', N'البيانات الرئيسية', 226, 1),
                (229, 'Zatca Transaction', N'المعاملات الخاصة بالهيئة', 'Transaction', N'المعاملات', 226, 1);
            ");

            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                (230, 'ETA Master Data', N'البيانات الرئيسية لالضرائب المصرية', 'Master Data', N'البيانات الرئيسية', 227, 1),
                (231, 'ETA Transaction', N'المعاملات الخاصة بالضرائب المصرية', 'Transaction', N'المعاملات', 227, 1);
            ");

            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                (232, 'Zatca School Configuration', N'المدرسة في هيئة الزكاة', 'School Configuration', N'المدرسة في هيئة الزكاة', 228, 1),
                (233, 'Zatca Devices', N'الاجهزة في هيئة الزكاة', 'Zatca Devices', N'الاجهزة في هيئة الزكاة', 228, 1),
                (234, 'Zatca Electronic-Invoice', N'الفاتورة الإلكترونية للهيئة', 'Electronic-Invoice', N'الفاتورة الإلكترونية للهيئة', 229, 1);
            ");

            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                (235, 'ETA School Configuration', N'المدرسة في الضرائب المصرية', 'School Configuration', N'المدرسة في الضرائب المصرية', 230, 1),
                (236, 'Point Of Sale', N'نقطة البيع', 'Point Of Sale', N'نقطة البيع', 230, 1),
                (237, 'Certificate Issuer', N'جهة إصدار الشهادة', 'Certificate Issuer', N'جهة إصدار الشهادة', 230, 1),
                (238, 'ETA Electronic-Invoice', N'الفاتورة الإلكترونية للضرائب المصرية', 'Electronic-Invoice', N'الفاتورة الإلكترونية للضرائب المصرية', 231, 1);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM Page WHERE ID BETWEEN 226 AND 238;");
        }
    }
}
