using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace LMS_CMS_BL.DTO.Inventory
{
    public class InventoryMasterAddDTO
    {
        //[Required(ErrorMessage = "Name is required")]
        //[StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        //public string Name { get; set; }
        public string? InvoiceNumber { get; set; }
        public DateOnly Date { get; set; }
        public bool IsCash { get; set; }
        public bool IsVisa { get; set; }
        public bool? IsConvertedToPurchase { get; set; }
        public decimal? CashAmount { get; set; }
        public decimal? VisaAmount { get; set; }
        public decimal? Remaining { get; set; }
        public decimal Total { get; set; }
        public string? Notes { get; set; }
        public List<IFormFile>? Attachment { get; set; }
        public long StoreID { get; set; }
        public long FlagId { get; set; }
        public long? StudentID { get; set; }
        public long? SaveID { get; set; }
        public long? SupplierId { get; set; }
        public long? BankID { get; set; }
        public long? SchoolId { get; set; }
        public long? StoreToTransformId { get; set; }
        public long? SchoolPCId { get; set; }
        public int? ETAPOSID { get; set; }
        //public char? InvoiceType { get; set; } = 'P';
        public List<InventoryDetailsAddDTO> InventoryDetails { get; set; }
    }
}
