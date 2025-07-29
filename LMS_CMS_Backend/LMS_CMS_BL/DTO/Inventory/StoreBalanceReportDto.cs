using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Inventory
{
    public class StoreBalanceReportDto
    {
        public long ItemCode { get; set; } // كود الصنف  ID
        public string ItemName { get; set; } 
        public int Quantity { get; set; } 
        public float? PurchasePrice { get; set; } 
        public float? SalesPrice { get; set; } 
        public decimal? AverageCost { get; set; } 
        public float? TotalPurchase { get; set; } 
        public float? TotalSales { get; set; } 
        public decimal? TotalCost { get; set; } 
        public int Limit { get; set; }
        public string AlertMessage { get; set; }
    }
}
