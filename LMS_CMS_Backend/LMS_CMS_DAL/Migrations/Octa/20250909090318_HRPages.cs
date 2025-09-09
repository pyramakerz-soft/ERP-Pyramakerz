using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class HRPages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES 
                    (340, 'Official Holidays', N'العطلات الرسمية', 'Official Holidays', N'العطلات الرسمية', 158, 1),
                    (341, 'Vacation Types', N'أنواع الإجازات', 'Vacation Types', N'أنواع الإجازات', 158, 1),
                    (342, 'Edit Attendance', N'تعديل الحضور', 'Edit Attendance', N'تعديل الحضور', 159, 1),
                    (343, 'Loans', N'القروض', 'Loans', N'القروض', 159, 1),
                    (344, 'Bonus', N'المكافآت', 'Bonus', N'المكافآت', 159, 1),
                    (345, 'Deduction', N'الخصومات', 'Deduction', N'الخصومات', 159, 1),
                    (346, 'Leave Request', N'طلب اذن', 'Leave Request', N'طلب اذن', 159, 1),
                    (347, 'Vacation Employee', N'إجازات الموظفين', 'Vacation Employee', N'إجازات الموظفين', 159, 1),
                    (348, 'Salary Calculation', N'حساب المرتب', 'Salary Calculation', N'حساب المرتب', 159, 1);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
               DELETE FROM Page WHERE ID IN (340,341,342,343,344,345,346,347,348);
            ");
        }
    }
}
