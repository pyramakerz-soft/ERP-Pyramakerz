using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class UpdateAccEntScript3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var assembly = typeof(AddGetSubAccNameScript).Assembly;
            var subAccName = "LMS_CMS_DAL.DbScripts.GetSubAccountInfo.sql";

            using var saStream = assembly.GetManifestResourceStream(subAccName);
            using var saReader = new StreamReader(saStream);
            var sql = saReader.ReadToEnd();
            migrationBuilder.Sql(sql);

            var filterEntries = "LMS_CMS_DAL.DbScripts.FilterEntries.sql";

            using var feStream = assembly.GetManifestResourceStream(filterEntries);
            using var feReader = new StreamReader(feStream);
            sql = feReader.ReadToEnd();
            migrationBuilder.Sql(sql);

            migrationBuilder.Sql("DROP FUNCTION IF EXISTS [dbo].[GetSubAccountName];");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS [dbo].[GetSubAccountInfo];");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS [dbo].[FilterEntries];");
        }
    }
}
