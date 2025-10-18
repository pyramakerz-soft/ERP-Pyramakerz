using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class ChangeClinicOder2Migration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET [Order] = 4 WHERE ID = 112;
                UPDATE Page SET [Order] = 5 WHERE ID = 115;
                UPDATE Page SET [Order] = 6 WHERE ID = 118;
                UPDATE Page SET [Order] = 7 WHERE ID = 119;
                UPDATE Page SET [Order] = 7 WHERE ID = 120;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET [Order] = 0 WHERE ID = 112;
                UPDATE Page SET [Order] = 0 WHERE ID = 115;
                UPDATE Page SET [Order] = 0 WHERE ID = 118;
                UPDATE Page SET [Order] = 0 WHERE ID = 119;
                UPDATE Page SET [Order] = 0 WHERE ID = 120;
            ");
        }
    }
}
