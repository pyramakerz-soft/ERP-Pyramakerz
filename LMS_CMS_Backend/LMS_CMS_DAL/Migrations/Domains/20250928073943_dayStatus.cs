using LMS_CMS_DAL.Models.Domains.HR;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class dayStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("INSERT INTO DayStatus (ID, Name) VALUES (1, 'Present')");
            migrationBuilder.Sql("INSERT INTO DayStatus (ID, Name) VALUES (2, 'Absent')");
            migrationBuilder.Sql("INSERT INTO DayStatus (ID, Name) VALUES (3, 'Vacation')");
            migrationBuilder.Sql("INSERT INTO DayStatus (ID, Name) VALUES (4, 'Official Holiday')");
            migrationBuilder.Sql("INSERT INTO DayStatus (ID, Name) VALUES (5, 'Weekend')");
            migrationBuilder.Sql("INSERT INTO DayStatus (ID, Name) VALUES (6, 'OverTime')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM DayStatus WHERE ID IN (1,2,3,4,5,6)");
        }
    }
}
