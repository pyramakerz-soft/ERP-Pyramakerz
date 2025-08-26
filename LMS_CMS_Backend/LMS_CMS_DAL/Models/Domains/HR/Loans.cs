using LMS_CMS_DAL.Models.Domains.AccountingModule;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.HR
{
    public class Loans : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public DateOnly Date { get; set; }
        public DateOnly DeductionStartMonth { get; set; }
        public long Amount { get; set; }
        public int NumberOfDeduction { get; set; }
        public string? Notes { get; set; }

        [ForeignKey("Employee")]
        public long EmployeeID { get; set; }
        public Employee Employee { get; set; }

        [ForeignKey("Safe")]
        public long SafeID { get; set; }
        public Save Save { get; set; }

    }
}
