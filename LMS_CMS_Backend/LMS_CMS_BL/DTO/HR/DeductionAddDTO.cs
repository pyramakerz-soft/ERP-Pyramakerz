using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class DeductionAddDTO
    {
        public long? ID { get; set; }
        public DateOnly Date { get; set; }
        public int NumberOfDeductionDays { get; set; }
        public int Hours { get; set; }
        public int Minutes { get; set; }
        public long Amount { get; set; }
        public string? Notes { get; set; }
        public long EmployeeID { get; set; }
        public string EmployeeEnName { get; set; }
        public string EmployeeArName { get; set; }
        public long DeductionTypeID { get; set; }
        public string DeductionTypeName { get; set; }
    }
}
