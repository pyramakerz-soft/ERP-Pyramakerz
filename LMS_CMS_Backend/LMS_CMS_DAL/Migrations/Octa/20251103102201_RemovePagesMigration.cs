using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class RemovePagesMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        { 
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 166;
            ");
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 165;
            ");
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 164;
            ");
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 150;
            ");
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 179;
            ");
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 181;
            ");
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 182;
            "); 
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 183;
            ");
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 184;
            ");
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 156;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
