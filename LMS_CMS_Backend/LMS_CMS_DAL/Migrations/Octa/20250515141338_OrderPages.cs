using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class OrderPages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Main Modules
            migrationBuilder.Sql("UPDATE Page SET [Order] = 1 WHERE ID = 11;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 2 WHERE ID = 37;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 3 WHERE ID = 34;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 4 WHERE ID = 48;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 5 WHERE ID = 76;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 6 WHERE ID = 148;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 7 WHERE ID = 149;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 8 WHERE ID = 150;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 9 WHERE ID = 111;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 10 WHERE ID = 151;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 11 WHERE ID = 152;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 12 WHERE ID = 153;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 13 WHERE ID = 154;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 14 WHERE ID = 155;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 15 WHERE ID = 127;");
            migrationBuilder.Sql("UPDATE Page SET [Order] = 16 WHERE ID = 156;");

            // Bus Module - child page
            migrationBuilder.Sql("UPDATE Page SET [Order] = 9 WHERE ID = 2;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page SET [Order] = NULL 
                WHERE ID IN (11, 37, 34, 48, 76, 148, 149, 150, 111, 151, 152, 153, 154, 155, 127, 156, 2);
            ");
        }
    }
}
