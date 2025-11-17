using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class AddAccountingReportsPages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES  
                (289, 'Supplier Statement', N'تقرير كشف حساب مورد', 'Supplier Statement', N'كشف حساب مورد', 203, 1),
                (290, 'Safe Statement', N'تقرير كشف حساب خزنة', 'Safe Statement', N'كشف حساب خزنة', 203, 1),
                (291, 'Bank Statement', N'تقرير كشف حساب بنك', 'Bank Statement', N'كشف حساب بنك', 203, 1),
                (292, 'Suppliers Balances', N'تقرير أرصدة موردين', 'Suppliers Balances', N'أرصدة موردين', 203, 1),
                (293, 'Safes Balances', N'تقرير أرصدة خزائن', 'Safes Balances', N'أرصدة خزائن', 203, 1),
                (294, 'Banks Balances', N'تقرير أرصدة بنوك', 'Banks Balances', N'أرصدة بنوك', 203, 1),
                (295, 'Suppliers Subledger', N'تقرير أستاذ مساعد موردين', 'Suppliers Subledger', N'أستاذ مساعد موردين', 203, 1),
                (296, 'Safes Subledger', N'تقرير أستاذ مساعد خزائن', 'Safes Subledger', N'أستاذ مساعد خزائن', 203, 1),
                (297, 'Banks Subledger', N'تقرير أستاذ مساعد بنوك', 'Banks Subledger', N'أستاذ مساعد بنوك', 203, 1)    
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM Page WHERE ID BETWEEN 289 AND 297;");
        }
    }
}
