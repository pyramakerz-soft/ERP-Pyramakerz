using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Inventory
{
    public class InventoryMasterReportDTO
    {
        public long ItemCode { get; set; }
        public string ItemName { get; set; }

        public long StoreCode { get; set; }
        public string StoreName { get; set; }

        public DateTime? DayDate { get; set; }
        public string InvoiceNumber { get; set; }
        public string Notes { get; set; }
        public string FlagName { get; set; }

        public string? SupplierName { get; set; }
        public string? StudentName { get; set; }
        public string? StoreNameTo { get; set; }
    }

}
