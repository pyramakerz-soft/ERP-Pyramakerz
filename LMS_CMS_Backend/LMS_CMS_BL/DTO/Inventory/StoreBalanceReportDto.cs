using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Inventory
{
    public class StoreBalanceReportDto
    {
        public long ItemCode { get; set; } // كود الصنف  ID
        public string ItemName { get; set; } // اسم الصنف
        public int Quantity { get; set; } // الكمية
        public float? PurchasePrice { get; set; } // سعر الشراء
        public float? SalesPrice { get; set; } // سعر البيع
        public decimal? AverageCost { get; set; } // متوسط التكلفة
        public float? TotalPurchase { get; set; } // إجمالي سعر الشراء
        public float? TotalSales { get; set; } // إجمالي سعر البيع
        public decimal? TotalCost { get; set; } // إجمالي التكلفة
        public int Limit { get; set; }
        public string AlertMessage { get; set; }
    }
}
