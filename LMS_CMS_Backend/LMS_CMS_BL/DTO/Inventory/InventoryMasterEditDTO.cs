using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Inventory
{
    public class InventoryMasterEditDTO
    {
        public long ID { get; set; }
        public string? InvoiceNumber { get; set; }
        public DateOnly Date { get; set; }
        public bool IsCash { get; set; }
        public bool IsVisa { get; set; }
        public bool? IsConvertedToPurchase { get; set; }
        public decimal? CashAmount { get; set; }
        public decimal? VisaAmount { get; set; }
        public decimal Remaining { get; set; }
        public decimal Total { get; set; }
        public string? Notes { get; set; }
        public List<IFormFile>? NewAttachments { get; set; }
        public List<string>? DeletedAttachments { get; set; }
        public long StoreID { get; set; }
        public long FlagId { get; set; }
        public long? StudentID { get; set; }
        public long? SaveID { get; set; }
        public long? SupplierId { get; set; }
        public long? BankID { get; set; }
        public bool? IsEditInvoiceNumber { get; set; }
        public long? StoreToTransformId { get; set; }
        public long? SchoolId { get; set; }
        public long? SchoolPCId { get; set; }
        public int? ETAPOSID { get; set; }
        public char? InvoiceType { get; set; }
        public DateTime? EtaInsertedDate { get; set; }

    }
}
