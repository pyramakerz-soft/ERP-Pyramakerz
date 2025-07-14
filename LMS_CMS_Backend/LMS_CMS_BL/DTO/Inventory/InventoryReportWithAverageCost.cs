using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Inventory
{
    public class InventoryAverageCostDTO
    {
        public decimal? AverageCost { get; set; }
        public string Date { get; set; }
        public long ShopItemID { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal TotalPrice { get; set; }
        public long FlagId { get; set; }
        public string enName { get; set; }
        public int ItemInOut { get; set; }

    }
}
