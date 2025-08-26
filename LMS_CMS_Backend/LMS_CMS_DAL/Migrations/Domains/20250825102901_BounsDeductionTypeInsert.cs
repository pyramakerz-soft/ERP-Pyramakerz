using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class BounsDeductionTypeInsert : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@" 
               INSERT INTO BounsType (ID, Name) VALUES (1, 'Hours'); 
               INSERT INTO BounsType (ID, Name) VALUES (2, 'Day'); 
               INSERT INTO BounsType (ID, Name) VALUES (3, 'Amount'); 
           ");

            migrationBuilder.Sql(@" 
               INSERT INTO DeductionType (ID, Name) VALUES (1, 'Hours'); 
               INSERT INTO DeductionType (ID, Name) VALUES (2, 'Day'); 
               INSERT INTO DeductionType (ID, Name) VALUES (3, 'Amount'); 
           ");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@" DELETE FROM BounsType WHERE ID IN (1, 2, 3); ");
            migrationBuilder.Sql(@" DELETE FROM DeductionType WHERE ID IN (1, 2, 3); ");
        }
    }
}
