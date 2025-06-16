using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Inventory
{
    public class InventoryTotalDTO
    {
        public long ShopItemId { get; set; }
        public string ItemName { get; set; }       // ✅ اسم الصنف
        public long StoreId { get; set; }
        public string StoreName { get; set; }      // ✅ اسم المخزن
        public string FlagName { get; set; }       // ✅ اسم الحركة (In / Out)
        public DateTime EndDate { get; set; }
        public int TotalQuantity { get; set; }
    }
}
