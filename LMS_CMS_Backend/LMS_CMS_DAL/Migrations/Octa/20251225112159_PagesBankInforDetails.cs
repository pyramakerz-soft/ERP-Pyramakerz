using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class PagesBankInforDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page
                SET en_name = 'Bank Infor Details',
                    ar_name = N'تفاصيل البنك',
                    enDisplayName_name = 'Bank Infor Details',
                    arDisplayName_name = N'تفاصيل البنك',
                    Page_ID = 158   -- نقل الصفحة إلى HR / Master Data
                    WHERE ID = 54; -- كانت تحت Accounting
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page
                SET 
                    en_name = 'Bank',
                    ar_name = N'البنك',
                    enDisplayName_name = 'Bank',
                    arDisplayName_name = N'البنك',
                    Page_ID = 201   -- الرجوع إلى Accounting
                    WHERE ID = 54;
            ");
        }
    }
}
