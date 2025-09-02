using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Maintenance
{
    public class MaintenanceGetDto
    {
        public long ID { get; set; }
        public DateOnly Date { get; set; }
        public long ItemID { get; set; }
        public string ItemArabicName { get; set; }
        public string ItemEnglishName { get; set; } 
        public string? CompanyEnglishName { get; set; }
        public string? CompanyArabicName { get; set; }
        public long CompanyID { get; set; } 
        public string? EmployeeEnglishName { get; set; }
        public string? EmployeeArabicName { get; set; }
        public long MaintenanceEmployeeID { get; set; } 
        public decimal Cost { get; set; }
        public string? Note { get; set; }
    }
}
