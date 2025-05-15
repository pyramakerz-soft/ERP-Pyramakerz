using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class EditNationalIDInCategoryFieldMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE CategoryField
                SET EnName = 'National ID number'
                WHERE ID IN (11, 17, 24);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE CategoryField
                SET EnName = 'ID No.'
                WHERE ID IN (11, 17, 24);
            ");
        }
    }
}
