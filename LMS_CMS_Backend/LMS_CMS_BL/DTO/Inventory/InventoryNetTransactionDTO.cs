using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Inventory
{
    public class InventoryNetTransactionDTO  //777
    {
        public string FlagName { get; set; }
        public string InvoiceNumber { get; set; }
        public string DayDate { get; set; } // أو DateTime لو حابب
        public string Notes { get; set; }

        public double Quantity { get; set; }

        public double TotalIn { get; set; }     // الكمية الموجبة
        public double TotalOut { get; set; }    // الكمية السالبة
        public double Balance { get; set; }     // الرصيد التراكمي حتى هذه الحركة

        public string SupplierName { get; set; }    // للمشتريات
        public string StudentName { get; set; }     // للمبيعات
        public string StoreToName { get; set; }     // للتحويلات

    }
}
