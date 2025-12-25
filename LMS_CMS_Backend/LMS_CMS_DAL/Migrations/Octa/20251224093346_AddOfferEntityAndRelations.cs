using LMS_CMS_DAL.Models.Octa;
using Microsoft.EntityFrameworkCore.Migrations;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class AddOfferEntityAndRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
            INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES 
            (376, 'Offers', N'الاقترحات', 'Offers', N'الاقترحات', 11, 1);
            ");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 376;
            ");
        }
    }
}


// Update-Database -Context Octa_DbContext
//  Add-Migration AddBankInfoEntityAndRelations -Context Octa_DbContext -OutputDir Migrations/Octa

//   migrationBuilder.Sql(@"UPDATE Page SET arDisplayName_name = N'الطلاب' WHERE ID = 158;");
// Add-Migration AddNullEntityAndRelations -Context LMS_CMS_Context -OutputDir Migrations/Domains
