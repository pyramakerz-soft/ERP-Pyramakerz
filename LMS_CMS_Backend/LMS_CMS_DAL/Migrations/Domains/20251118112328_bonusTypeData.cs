using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class bonusTypeData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@" 
               INSERT INTO BonusType (ID, Name) VALUES (1, 'Hours'); 
               INSERT INTO BonusType (ID, Name) VALUES (2, 'Day'); 
               INSERT INTO BonusType (ID, Name) VALUES (3, 'Amount'); 
           ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM BonusType WHERE ID IN (1, 2, 3); ");
        }
    }
}
