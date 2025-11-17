using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.HR
{
    public class SalaryHistory : AuditableEntity
    {
        public long Id { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal BasicSalary { get; set; }

        // Totals from attendance & transactions
        public decimal TotalBonus { get; set; }
        public decimal TotalOvertime { get; set; }
        public decimal TotalDeductions { get; set; }
        public decimal TotalLoans { get; set; }

        // Final Calculated Salary
        public decimal NetSalary { get; set; }

        public long EmployeeId { get; set; }
        public Employee Employee { get; set; }
    }
}
