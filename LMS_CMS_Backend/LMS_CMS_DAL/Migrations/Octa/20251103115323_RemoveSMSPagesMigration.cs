using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class RemoveSMSPagesMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 170;
            "); 
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 171;
            "); 
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 172;
            "); 
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 152;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
