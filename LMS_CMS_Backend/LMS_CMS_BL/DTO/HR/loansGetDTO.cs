using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class loansGetDTO
    {
        public long ID { get; set; }
        public DateOnly Date { get; set; }
        public DateOnly DeductionStartMonth { get; set; }
        public long Amount { get; set; }
        public int NumberOfDeduction { get; set; }
        public string? Notes { get; set; }
        public long EmployeeID { get; set; }
        public string EmployeeEnName { get; set; }
        public string EmployeeArName { get; set; }
        public long SafeID { get; set; }
        public string SaveName { get; set; }
    }
}
