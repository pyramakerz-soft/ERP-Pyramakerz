using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Inventory
{
    public class AllStoresBalanceReportDto
    {
        public long ItemCode { get; set; } // كود الصنف
        public string ItemName { get; set; } // اسم الصنف
        public string StoreName { get; set; } // اسم المخزن
        public int Quantity { get; set; } // الكمية
        public float? PurchasePrice { get; set; } // سعر الشراء
        public decimal? TotalPurchaseValue { get; set; } // القيمة الإجمالية بسعر الشراء
        public float? SalesPrice { get; set; } // سعر البيع
        public decimal? TotalSalesValue { get; set; } // القيمة الإجمالية بسعر البيع
        public decimal? AverageCost { get; set; } // متوسط التكلفة
        public decimal? TotalCost { get; set; } // إجمالي التكلفة
    }
}
