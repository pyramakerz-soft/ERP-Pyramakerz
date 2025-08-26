using LMS_CMS_DAL.Models.Domains.AccountingModule;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.HR
{
    public class Bouns : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public DateOnly Date { get; set; }
        public int NumberOfBounsDays { get; set; }
        public int Hours { get; set; }
        public int Minutes { get; set; }
        public long Amount { get; set; }

        public string? Notes { get; set; }

        [ForeignKey("Employee")]
        public long EmployeeID { get; set; }
        public Employee Employee { get; set; }

        [ForeignKey("BounsType")]
        public long BounsTypeID { get; set; }
        public BounsType BounsType { get; set; }

    }
}
