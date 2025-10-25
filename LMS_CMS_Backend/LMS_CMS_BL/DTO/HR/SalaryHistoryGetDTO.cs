using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class SalaryHistoryGetDTO
    {
        public long Id { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal BasicSalary { get; set; }
        public decimal TotalBonus { get; set; }
        public decimal TotalOvertime { get; set; }
        public decimal TotalDeductions { get; set; }
        public decimal TotalLoans { get; set; }
        public decimal NetSalary { get; set; }
        public long EmployeeId { get; set; }
        public string EmployeeEnName { get; set; }
        public string EmployeeArName { get; set; }
    }
}
