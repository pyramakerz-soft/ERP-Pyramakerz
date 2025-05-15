using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class OrderDetailsPages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE Page SET [Order] = 9 WHERE ID = 1;");

            migrationBuilder.Sql("UPDATE Page SET [Order] = 2 WHERE ID BETWEEN 49 AND 75;");

            migrationBuilder.Sql("UPDATE Page SET [Order] = 0 WHERE ID = 79;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 1 WHERE ID = 84;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 2 WHERE ID = 85;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 3 WHERE ID = 77;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 4 WHERE ID = 93;");



        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
