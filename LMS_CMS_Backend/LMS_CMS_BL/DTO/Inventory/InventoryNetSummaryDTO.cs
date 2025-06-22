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
        public string ToDate { get; set; }
        public decimal InQuantity { get; set; }
        public decimal outQuantity { get; set; }
        public decimal Balance { get; set; }

    }
}
