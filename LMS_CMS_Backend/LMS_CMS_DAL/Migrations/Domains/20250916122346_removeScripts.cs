using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class removeScripts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS [dbo].[EntriesFun];");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS [dbo].[GetAccountingEntries];");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS [dbo].[GetAccountingTotals];");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS [dbo].[GetEntriesCount];");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS [dbo].[GetAccountLedger];");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS [dbo].[GetAccountBalance];");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS [dbo].[GetAccountStatement];");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS [dbo].[GetSubAccountInfo];");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
