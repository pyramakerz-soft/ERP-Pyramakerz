using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class ClinicEditTransactionPagesMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"  
                UPDATE Page SET en_name = 'Clinic Transaction' WHERE ID = 372;   
                UPDATE Page SET enDisplayName_name = 'Transaction' WHERE ID = 372;  
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"  
                UPDATE Page SET en_name = 'Clinic Transaction' WHERE ID = 372;   
                UPDATE Page SET enDisplayName_name = 'Transaction' WHERE ID = 372;  
            ");
        }
    }
}
