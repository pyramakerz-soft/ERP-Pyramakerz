using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class AddGetDistinctDateCountAndUpdatedEntriesFunandAccountingEntries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            ExecuteEmbeddedSql(migrationBuilder, "LMS_CMS_DAL.DbScripts.EntriesFunV03.sql");
            ExecuteEmbeddedSql(migrationBuilder, "LMS_CMS_DAL.DbScripts.GetAccountingEntriesV04.sql");
            //ExecuteEmbeddedSql(migrationBuilder, "LMS_CMS_DAL.DbScripts.GetDistinctDateCount.sql");
        }

        private void ExecuteEmbeddedSql(MigrationBuilder migrationBuilder, string resourceName)
        {
            var assembly = typeof(AddGetDistinctDateCountAndUpdatedEntriesFunandAccountingEntries).Assembly;

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
