using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class UpdateDbScriptsNov30 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            ExecuteEmbeddedSql(migrationBuilder, "LMS_CMS_DAL.DbScripts.GetSubAccountInfoV03.sql");
            ExecuteEmbeddedSql(migrationBuilder, "LMS_CMS_DAL.DbScripts.EntriesFunV05.sql");
            ExecuteEmbeddedSql(migrationBuilder, "LMS_CMS_DAL.DbScripts.GetAccountingEntriesV06.sql");
            ExecuteEmbeddedSql(migrationBuilder, "LMS_CMS_DAL.DbScripts.GetAccountBalanceV03.sql");
        }

        private void ExecuteEmbeddedSql(MigrationBuilder migrationBuilder, string resourceName)
        {
            var assembly = typeof(UpdateDbScriptsNov30).Assembly;

            using var stream = assembly.GetManifestResourceStream(resourceName)
                ?? throw new FileNotFoundException($"Embedded SQL script not found: {resourceName}");

            using var reader = new StreamReader(stream);
            var sql = reader.ReadToEnd();

            migrationBuilder.Sql(sql);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
