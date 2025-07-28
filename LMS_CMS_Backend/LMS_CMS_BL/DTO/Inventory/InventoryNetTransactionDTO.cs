using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Inventory
{
    public class InventoryNetTransactionDTO  //77
    {
        public DateTime Date { get; set; }             
        public long FlagId { get; set; }               
        public string FlagName { get; set; }           
        public string InvoiceNumber { get; set; }      
        public string Notes { get; set; }              

        public decimal inQuantity { get; set; }          
        public decimal outQuantity { get; set; }          
        public decimal Quantity { get; set; }          
        public decimal Balance { get; set; }          
        public decimal Price { get; set; }             
        public decimal TotalPrice { get; set; }        
        public decimal? AverageCost { get; set; }      
        public int ItemInOut { get; set; }             
        public string SupplierName { get; set; }       
        public string StudentName { get; set; }        
        public string StoreName { get; set; }         
        public string StoreToName { get; set; }        
    }

}

