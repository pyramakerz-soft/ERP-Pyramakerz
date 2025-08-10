using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class UpdateDbScripts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var assembly = typeof(UpdateDbScripts).Assembly;

            var scripts = new[]
            {
                "LMS_CMS_DAL.DbScripts.EntriesFun.sql",
                "LMS_CMS_DAL.DbScripts.GetAccountingEntries.sql",
                "LMS_CMS_DAL.DbScripts.GetAccountingTotals.sql",
                "LMS_CMS_DAL.DbScripts.GetEntriesCount.sql",
                "LMS_CMS_DAL.DbScripts.GetAccountLedger.sql",
                "LMS_CMS_DAL.DbScripts.GetAccountSummary.sql"
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
