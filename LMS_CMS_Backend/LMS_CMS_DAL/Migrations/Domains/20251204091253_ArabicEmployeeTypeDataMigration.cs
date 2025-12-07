using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class ArabicEmployeeTypeDataMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE EmployeeType
                    SET ArabicName = N'موظف'
                    WHERE ID = 1;

                UPDATE EmployeeType
                    SET ArabicName = N'سائق'
                    WHERE ID = 2;

                UPDATE EmployeeType
                    SET ArabicName = N'مساعد سائق'
                    WHERE ID = 3;

                UPDATE EmployeeType
                    SET ArabicName = N'معلم'
                    WHERE ID = 4;
 
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
