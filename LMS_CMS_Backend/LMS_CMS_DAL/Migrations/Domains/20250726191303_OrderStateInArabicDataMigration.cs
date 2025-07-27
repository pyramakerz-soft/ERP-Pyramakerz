using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class OrderStateInArabicDataMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE OrderState SET ArabicName = N'قيد الانتظار' WHERE ID = 1;
                UPDATE OrderState SET ArabicName = N'تم التوصيل' WHERE ID = 2;
                UPDATE OrderState SET ArabicName = N'ألغيت' WHERE ID = 3;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE OrderState SET ArabicName = NULL WHERE ID IN (1, 2, 3);
            ");
        }
    }
}
