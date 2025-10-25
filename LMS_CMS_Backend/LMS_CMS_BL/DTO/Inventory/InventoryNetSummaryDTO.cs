using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Inventory
{
    public class InventoryNetSummaryDTO   //777
    {
        public long ShopItemId { get; set; }
        public long StoreId { get; set; }
        public DateOnly ToDate { get; set; }
        //public DateTime FromDate { get; set; }
        public decimal InQuantity { get; set; }
        public decimal outQuantity { get; set; }
        public decimal? Quantitybalance { get; set; }
        public decimal? CostBalance { get; set; }
    }
}
