using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class TaxIssuerPageMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                    (218, 'Tax Issuer', N'مصدر الضرائب', 'Tax Issuer', N'جهة إصدار الضرائب', 11, 1)
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                 DELETE FROM Page WHERE ID IN (218);
             ");
        }
    }
}
