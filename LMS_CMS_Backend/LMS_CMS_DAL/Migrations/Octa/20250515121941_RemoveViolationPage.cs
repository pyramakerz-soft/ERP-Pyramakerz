using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class RemoveViolationPage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove the Violations page (ID = 10)
            migrationBuilder.Sql("DELETE FROM Page WHERE ID = 10");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Restore the Violations page in case of rollback
            migrationBuilder.Sql(@"
                INSERT INTO Page (ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay)
                VALUES (10, 'Violations', N'المخالفات', 'Violations', N'المخالفات', 1, 1);
            ");
        }
    }
}
