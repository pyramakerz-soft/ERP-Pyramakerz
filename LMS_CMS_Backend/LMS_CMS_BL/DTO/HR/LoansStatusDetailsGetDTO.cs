using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class LoansStatusDetailsGetDTO
    {
        public long EmployeeId { get; set; }
        public string EmployeeEnName { get; set; }
        public string EmployeeArName { get; set; }

        public List<loansGetDTO> LoansDTO { get; set; }
        public List<EmployeeLoansGetDTO> EmployeeLoansGetDTO { get; set; }
        public decimal TotalLoans { get; set; }
        public decimal TotalDeducted { get; set; }
        public decimal Remaining { get; set; }
    }
}
