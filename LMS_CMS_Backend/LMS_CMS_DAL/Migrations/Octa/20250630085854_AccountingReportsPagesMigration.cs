using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class AccountingReportsPagesMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES  
                (239, 'Fees Activation Report', N'تقرير تفعيل الرسوم', 'Fees Activation', N'تفعيل الرسوم', 203, 1),
                (240, 'Receivable Report', N'تقرير مستحق القبض', 'Receivable', N'مستحق القبض', 203, 1),
                (241, 'Payable Report', N'تقرير مستحق الدفع', 'Payable', N'مستحق الدفع', 203, 1),
                (242, 'Installment Deduction Report', N'تقرير خصم الأقساط', 'Installment Deduction', N'خصم الأقساط', 203, 1),
                (243, 'Accounting Entries Report', N'تقرير القيود المحاسبية', 'Accounting Entries', N'القيود المحاسبية', 203, 1);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM Page WHERE ID BETWEEN 239 AND 243;");
        }
    }
}
