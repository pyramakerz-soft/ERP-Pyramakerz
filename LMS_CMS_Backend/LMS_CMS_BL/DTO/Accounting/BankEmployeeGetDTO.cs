using LMS_CMS_DAL.Models.Domains;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Accounting
{
    public class BankEmployeeGetDTO
    {
        public long ID { get; set; } 
        public long EmployeeID { get; set; } 
        public string EmployeeEnglishName { get; set; } 
        public string EmployeeArabicName { get; set; } 
        public long BankID { get; set; }
        public long? InsertedByUserId { get; set; }
    }
}
