using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class UpdateAccountStatementScript : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var assembly = typeof(UpdateAccountStatementScript).Assembly;

            var scriptName = "LMS_CMS_DAL.DbScripts.GetAccountStatementV02.sql";

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
