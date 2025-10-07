using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Violation
{
    public class ViolationEditDTO 
    {
        public long ID { get; set; }
        public string? Details { get; set; }
        public IFormFile? AttachFile { get; set; }
        public DateOnly Date { get; set; }
        public long ViolationTypeID { get; set; }
        public long EmployeeID { get; set; } 
    }
}
