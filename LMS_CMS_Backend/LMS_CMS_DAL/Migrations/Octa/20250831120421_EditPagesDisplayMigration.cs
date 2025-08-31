using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class EditPagesDisplayMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET enDisplayName_name = 'Master Data' WHERE ID = 138;
            ");
            migrationBuilder.Sql(@"
                UPDATE Page SET enDisplayName_name = 'Transaction' WHERE ID = 143;
            ");
            migrationBuilder.Sql(@"
                UPDATE Page SET enDisplayName_name = 'Master Data' WHERE ID = 192;
            ");
            migrationBuilder.Sql(@"
                UPDATE Page SET enDisplayName_name = 'Transaction' WHERE ID = 193;
            ");  
            migrationBuilder.Sql(@"
                UPDATE Page SET enDisplayName_name = 'Reports' WHERE ID = 194;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET enDisplayName_name = 'Evaluation Master Data' WHERE ID = 138;
            ");
            migrationBuilder.Sql(@"
                UPDATE Page SET enDisplayName_name = 'Evaluation Transaction' WHERE ID = 143;
            ");
            migrationBuilder.Sql(@"
                UPDATE Page SET enDisplayName_name = 'Daily Performance Master Data' WHERE ID = 192;
            ");
            migrationBuilder.Sql(@"
                UPDATE Page SET enDisplayName_name = 'Daily Performance Transaction' WHERE ID = 193;
            ");
            migrationBuilder.Sql(@"
                UPDATE Page SET enDisplayName_name = 'Daily Performance Reports' WHERE ID = 194;
            ");
        }
    }
}
