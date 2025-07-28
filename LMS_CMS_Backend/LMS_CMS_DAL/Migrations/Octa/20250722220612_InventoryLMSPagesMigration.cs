using LMS_CMS_DAL.Models.Domains.Inventory;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class InventoryLMSPagesMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES  
                (269, 'Store Items Balance', N'رصيد الأصناف بمخزن', 'Store Items Balance', N'رصيد الأصناف بمخزن', 244, 1),
                (270, 'Store Items Balance with Purchase', N'رصيد أصناف المخزن مع سعر الشراء', 'Store Items Balance with Purchase', N'رصيد أصناف المخزن مع سعر الشراء', 244, 1),
                (271, 'Store Items Balance with Sales', N'رصيد أصناف المخزن مع سعر البيع', 'Store Items Balance with Sales', N'رصيد أصناف المخزن مع سعر البيع', 244, 1),
                (272, 'Store Items Balance with Average Cost', N'رصيد أصناف المخزن مع متوسط التكلفة', 'Store Items Balance with Average Cost', N'رصيد أصناف المخزن مع متوسط التكلفة', 244, 1),
                (273, 'Store Limited Items', N'الأصناف المحدودة في المخازن', 'Store Limited Items', N'الأصناف المحدودة في المخازن', 244, 1),
                (274, 'All Stores Item Balance', N'رصيد الأصناف بجميع المخازن', 'All Stores Item Balance', N'رصيد الأصناف بجميع المخازن', 244, 1),
                (275, 'All Stores Item Balance with Purchase', N'رصيد الأصناف بجميع المخازن مع سعر الشراء', 'All Stores Item Balance with Purchase', N'رصيد الأصناف بجميع المخازن مع سعر الشراء', 244, 1),
                (276, 'All Stores Item Balance with Sales', N'رصيد الأصناف بجميع المخازن مع سعر البيع', 'All Stores Item Balance with Sales', N'رصيد الأصناف بجميع المخازن مع سعر البيع', 244, 1),
                (277, 'All Stores Item Balance with Average Cost', N'رصيد الأصناف بجميع المخازن مع متوسط التكلفة', 'All Stores Item Balance with Average Cost', N'رصيد الأصناف بجميع المخازن مع متوسط التكلفة', 244, 1),
                (278, 'Time Table', N'جدول الحصص', 'Time Table', N'جدول الحصص', 34, 1),
                (279, 'Duty Table', N'جدول الحصص الإحتياطية', 'Duty Table', N'جدول الحصص الإحتياطية', 34, 1)
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM Page WHERE ID BETWEEN 269 AND 279;");
        }
    }
} 