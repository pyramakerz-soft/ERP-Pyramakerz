using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.HR
{
    public class EmployeeLoans : AuditableEntity
    {
        public long ID { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal Amount { get; set; }

        [ForeignKey("Loans")]
        public long loanId { get; set; }
        public Loans Loans { get; set; }

        [ForeignKey("Employee")]
        public long EmployeeId { get; set; }
        public Employee Employee { get; set; }
    }
}
