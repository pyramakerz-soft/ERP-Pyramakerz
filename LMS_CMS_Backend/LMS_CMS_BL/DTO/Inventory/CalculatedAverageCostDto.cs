using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Inventory
{
    public class CalculatedAverageCostDto
    {
        public long ShopItemId { get; set; }
        public DateTime DayDate { get; set; }
        public decimal AverageCost { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal TotalPrice { get; set; }
    }


}
