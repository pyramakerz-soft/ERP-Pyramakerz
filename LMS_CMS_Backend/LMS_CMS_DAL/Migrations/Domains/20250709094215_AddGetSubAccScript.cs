using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class AddGetSubAccScript : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var assembly = typeof(AddGetSubAccScript).Assembly;
            var filterEntries = "LMS_CMS_DAL.DbScripts.FilterEntries.sql"; // Use actual namespace path

            using var feStream = assembly.GetManifestResourceStream(filterEntries);
            using var feReader = new StreamReader(feStream);
            var sql = feReader.ReadToEnd();
            migrationBuilder.Sql(sql);

            var subAccName = "LMS_CMS_DAL.DbScripts.GetSubAccountName.sql"; // Use actual namespace path

            using var saStream = assembly.GetManifestResourceStream(subAccName);
            using var saReader = new StreamReader(saStream);
            sql = saReader.ReadToEnd();
            migrationBuilder.Sql(sql);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS [dbo].[FilterEntries];");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS [dbo].[GetSubAccountName];");
        }
    }
}
