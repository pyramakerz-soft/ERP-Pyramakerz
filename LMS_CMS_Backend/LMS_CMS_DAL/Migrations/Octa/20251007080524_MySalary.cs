using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class MySalary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                    (366, 'My Salary Detailed', N' راتبى التفصيلي', 'My Salary Detailed', N'راتبى التفصيلي', 160, 1),
                    (367, 'My Salary Summary', N' ملخص راتبى', 'My Salary Summary', N'ملخص راتبى', 160, 1),
                    (368, 'My Attendance', N' حضوري الشهرى ', 'My Attendance', N'حضوري الشهرى', 160, 1);
            ");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID IN (366, 367, 368);
            ");
        }
    }
}
