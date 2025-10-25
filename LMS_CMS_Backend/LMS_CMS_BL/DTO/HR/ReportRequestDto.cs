using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class ReportRequestDto
    {
        public long? EmployeeId { get; set; }
        public long? JobId { get; set; }
        public long? CategoryId { get; set; }
        public DateOnly DateFrom { get; set; }
        public DateOnly DateTo { get; set; }
    }
}
