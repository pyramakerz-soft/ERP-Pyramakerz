using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class ClinicAssignPagesMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET Page_ID = 371 WHERE ID = 114; 
                UPDATE Page SET Page_ID = 371 WHERE ID = 113; 
                UPDATE Page SET Page_ID = 371 WHERE ID = 112; 
                UPDATE Page SET Page_ID = 371 WHERE ID = 126; 
            ");
            migrationBuilder.Sql(@"
                UPDATE Page SET Page_ID = 372 WHERE ID = 115; 
                UPDATE Page SET Page_ID = 372 WHERE ID = 118; 
                UPDATE Page SET Page_ID = 372 WHERE ID = 119;  
            ");
            migrationBuilder.Sql(@"
                UPDATE Page SET Page_ID = 373 WHERE ID = 120;   
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET Page_ID = 111 WHERE ID = 114; 
                UPDATE Page SET Page_ID = 111 WHERE ID = 113; 
                UPDATE Page SET Page_ID = 111 WHERE ID = 112; 
                UPDATE Page SET Page_ID = 111 WHERE ID = 126; 
            ");
            migrationBuilder.Sql(@"
                UPDATE Page SET Page_ID = 111 WHERE ID = 115; 
                UPDATE Page SET Page_ID = 111 WHERE ID = 118; 
                UPDATE Page SET Page_ID = 111 WHERE ID = 119;  
            ");
            migrationBuilder.Sql(@"
                UPDATE Page SET Page_ID = 111 WHERE ID = 120;   
            ");
        }
    }
}
