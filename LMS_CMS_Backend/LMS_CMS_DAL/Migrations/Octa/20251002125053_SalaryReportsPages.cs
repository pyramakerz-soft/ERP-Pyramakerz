using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class SalaryReportsPages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                    (362, 'Hr Employees Report', N'تقرير الموظفين', 'Employees', N'الموظفين', 160, 1),
                    (363, 'Employee Salary Detailed Report', N'تقرير الراتب التفصيلي', 'Employee Salary Detailed', N'الراتب التفصيلي', 160, 1),
                    (364, 'Salary Summary Report', N'تقرير ملخص الراتب', 'Salary Summary', N'ملخص الرواتب', 160, 1),
                    (365, 'HR Attendance Report', N'تقرير الحضور للموارد البشرية', 'Attendance', N'الحضور', 160, 1);
            ");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID IN (362, 363, 364 , 365);
            ");
        }
    }
}
