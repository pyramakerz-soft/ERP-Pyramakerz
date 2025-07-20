using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Inventory
{
    public class InventoryNetTransactionDTO
    {
        public DateTime Date { get; set; }             // تاريخ الحركة الفعلي
        public long FlagId { get; set; }               // رقم نوع الحركة
        public string FlagName { get; set; }           // اسم نوع الحركة (وارد - صادر)
        public string InvoiceNumber { get; set; }      // رقم الفاتورة
        public string Notes { get; set; }              // الملاحظات

        public decimal Quantity { get; set; }          // الكمية للحركة الحالية
        public decimal Price { get; set; }             // سعر الوحدة
        public decimal TotalPrice { get; set; }        // السعر الإجمالي
        public decimal? AverageCost { get; set; }      // التكلفة المتوسطة (إن وجدت)

        public int ItemInOut { get; set; }             // 1 = وارد، -1 = صادر، 0 = محايد

        public string SupplierName { get; set; }       // للمشتريات
        public string StudentName { get; set; }        // للمبيعات
        public string StoreName { get; set; }          // اسم المخزن الأساسي
        public string StoreToName { get; set; }        // للمخزن المحول إليه (في حالة التحويل)
    }

}

