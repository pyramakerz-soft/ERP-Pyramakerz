using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Maintenance
{
    public class MaintenanceReportRequestDto
    {
        [Required]
        public DateOnly FromDate { get; set; }

        [Required]
        public DateOnly ToDate { get; set; }

        public long? ItemId { get; set; }
        public long? MaintenanceEmployeeId { get; set; }
        public long? CompanyId { get; set; }

        // 1 = Company,
        // 2 = Employee,
        // null = Both
        public int? FilterBy { get; set; }
    }
}
