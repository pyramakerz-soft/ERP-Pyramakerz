using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class ClinicDivisionMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                    (371, 'Clinic Master Date', N'البيانات الرئيسية للعيادة', 'Master Date', N'البيانات الرئيسية', 111, 1),
                    (372, 'Clinic Transaction Date', N'المعاملات الخاصة بالعيادة', 'Transaction Date', N'المعاملات', 111, 1),
                    (373, 'Clinic Reports', N'تقارير العيادة', 'Reports', N'التقارير', 111, 1);
            "); 
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 371;
            ");
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 372;
            ");
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 373;
            ");
        }
    }
}
