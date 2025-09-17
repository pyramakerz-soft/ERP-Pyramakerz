using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class AddDBScriptsV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS [dbo].[FilterEntries];");

            var assembly = typeof(UpdateDbScripts).Assembly;

            var scripts = new[]
            {
                "LMS_CMS_DAL.DbScripts.GetSubAccountInfoV02.sql",
                "LMS_CMS_DAL.DbScripts.EntriesFunV02.sql",
                "LMS_CMS_DAL.DbScripts.GetAccountingEntriesV02.sql",
                "LMS_CMS_DAL.DbScripts.GetAccountingTotalsV02.sql",
                "LMS_CMS_DAL.DbScripts.GetEntriesCountV02.sql",
                "LMS_CMS_DAL.DbScripts.GetAccountLedgerV02.sql",
                "LMS_CMS_DAL.DbScripts.GetAccountBalanceV02.sql",
                "LMS_CMS_DAL.DbScripts.GetAccountStatementV02.sql"
            };

            foreach (var scriptName in scripts)
            {
                using var stream = assembly.GetManifestResourceStream(scriptName);
                if (stream == null)
                    throw new FileNotFoundException($"Embedded SQL script not found: {scriptName}");

                using var reader = new StreamReader(stream);
                var sql = reader.ReadToEnd();

                if (!string.IsNullOrWhiteSpace(sql))
                {
                    migrationBuilder.Sql(sql);
                }
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
