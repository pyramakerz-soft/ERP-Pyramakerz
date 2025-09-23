using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class InsertReportsMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                    (354, 'Loans Report', N'تقرير القروض', 'Loans', N'القروض', 160, 1),
                    (355, 'Bonus Report', N'تقرير المكافأة', 'Bonus', N'المكافأة', 160, 1),
                    (356, 'Deduction Report', N'تقرير الخصم', 'Deduction', N'الخصم', 160, 1),
                    (357, 'Employee Job Report', N'تقرير وظيفة الموظف', 'Employee Job', N'وظيفة الموظف', 160, 1),
                    (358, 'Vacation Report', N'تقرير الإجازة', 'Vacation', N'الإجازة', 160, 1),
                    (359, 'Leave Request Report', N'تقرير طلب الإجازة', 'Leave Request', N'طلب الإجازة', 160, 1);
            ");

            migrationBuilder.Sql(@"
                UPDATE Page SET arDisplayName_name = 'الطلاب' WHERE ID = 221;
            ");

            migrationBuilder.Sql(@"
                UPDATE Page SET enDisplayName_name = 'Students' WHERE ID = 221;
            ");

            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID in (289, 290, 291, 292, 293, 294, 295, 296, 297); 
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID IN (354, 355, 356, 357, 358, 359);
            ");

            migrationBuilder.Sql(@"
                UPDATE Page SET arDisplayName_name = N'طالب' WHERE ID = 221;
            ");

            migrationBuilder.Sql(@"
                UPDATE Page SET enDisplayName_name = 'Student' WHERE ID = 221;
            ");
        }
    }
}
