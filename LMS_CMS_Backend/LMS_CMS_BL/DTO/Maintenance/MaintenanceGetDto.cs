using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Maintenance
{
    public class MaintenanceGetDto
    {
        public long ID { get; set; }
        public DateOnly Date { get; set; }
        public string ItemName { get; set; }
        public string Type { get; set; }
        public string? CompanyName { get; set; }
        public string? EmployeeName { get; set; }
        public decimal Cost { get; set; }
        public string? Note { get; set; }
    }
}
