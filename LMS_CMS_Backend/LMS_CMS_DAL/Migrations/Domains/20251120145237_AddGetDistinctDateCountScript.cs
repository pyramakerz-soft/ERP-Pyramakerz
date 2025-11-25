using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class AddGetDistinctDateCountScript : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var assembly = typeof(AddGetDistinctDateCountScript).Assembly;
            var subAccName = "LMS_CMS_DAL.DbScripts.GetDistinctDateCount.sql"; 

            using var saStream = assembly.GetManifestResourceStream(subAccName);
            using var saReader = new StreamReader(saStream);
            var sql = saReader.ReadToEnd();
            migrationBuilder.Sql(sql);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
