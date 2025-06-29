using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Accounting
{
    public class FeesActivationGetDTO
    {
        [Key]
        public long ID { get; set; }
        public decimal Amount { get; set; }
        public float Discount { get; set; }
        public decimal Net { get; set; }
        public string Date { get; set; }
        public long FeeTypeID { get; set; }
        public string? FeeTypeName { get; set; }
        public long? FeeDiscountTypeID { get; set; }
        public string? FeeDiscountTypeName { get; set; }
        public long StudentID { get; set; }
        public string? StudentName { get; set; }
        public long? InsertedByUserId { get; set; }
        public long AcademicYearId { get; set; }
        public string? AcademicYearName { get; set; }
    }
}
