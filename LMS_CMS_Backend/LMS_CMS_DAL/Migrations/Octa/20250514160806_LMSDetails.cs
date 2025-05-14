using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class LMSDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET Page_ID = 34 WHERE ID BETWEEN 185 AND 191;
                UPDATE Page SET enDisplayName_name = 'Administration' ,en_name ='Administration' WHERE ID =11;

            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET Page_ID = NULL WHERE ID BETWEEN 185 AND 191;
                UPDATE Page SET enDisplayName_name = 'Administrator' ,en_name ='Administrator' WHERE ID =11;

            ");
        }
    }
}
