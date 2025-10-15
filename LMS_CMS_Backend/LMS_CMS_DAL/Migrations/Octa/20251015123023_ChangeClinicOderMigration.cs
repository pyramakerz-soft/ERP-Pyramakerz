using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class ChangeClinicOderMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET [Order] = 1 WHERE ID = 114;
                UPDATE Page SET [Order] = 2 WHERE ID = 126;
                UPDATE Page SET [Order] = 3 WHERE ID = 113;
            "); 
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET [Order] = 0 WHERE ID = 114;
                UPDATE Page SET [Order] = 0 WHERE ID = 126;
                UPDATE Page SET [Order] = 0 WHERE ID = 113;
            ");
        }
    }
}
