using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class AddDefaultValuesToAccConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO AccountingConfigurations (SalesID, SalesReturnID, PurchaseID, PurchaseReturnID)
                VALUES 
                (NULL, NULL, NULL, NULL);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM AccountingConfigurations
            ");
        }
    }
}
