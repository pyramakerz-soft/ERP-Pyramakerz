using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Violation
{
    public class ViolationReportDTO
    {
        public long ID { get; set; }
        public DateOnly Date { get; set; } 
        public string ViolationType { get; set; }
        public string EmployeeType { get; set; }
        public string EmployeeName { get; set; }
        public string? Details { get; set; }
        public string? AttachmentUrl { get; set; }
    }
}
