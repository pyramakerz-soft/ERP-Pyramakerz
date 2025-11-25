using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Inventory
{
    public class InventoryDetailsPutDTO
    {
        public long ID { get; set; }
        public int Quantity { get; set; }
        public string? Notes { get; set; }
        public decimal Price { get; set; }
        public decimal TotalPrice { get; set; }
        public long ShopItemID { get; set; }
        public long InventoryMasterId { get; set; }
    }
}
