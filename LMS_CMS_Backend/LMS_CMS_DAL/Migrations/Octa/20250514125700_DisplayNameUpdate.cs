using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class DisplayNameUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page
                SET 
                    enDisplayName_name = en_name,
                    arDisplayName_name = ar_name
                WHERE ID BETWEEN 1 AND 146;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page
                SET 
                    enDisplayName_name = NULL,
                    arDisplayName_name = NULL
                WHERE ID BETWEEN 1 AND 146;
            ");
        }
    }
}
