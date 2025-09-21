using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class LoansReportDto
    {
        public long EmployeeId { get; set; }
        public string EmployeeEnName { get; set; }
        public string EmployeeArName { get; set; }

        public decimal TotalAmount { get; set; }
        public List<loansGetDTO> Loans { get; set; } = new List<loansGetDTO>();
    }
}
