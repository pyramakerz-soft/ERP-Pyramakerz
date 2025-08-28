using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Maintenance
{
    public class MaintenanceAddDto
    {
        [Required]
        public DateOnly Date { get; set; }

        [Required]
        public long ItemID { get; set; }

        public long? CompanyID { get; set; }
        public long? MaintenanceEmployeeID { get; set; }

        [Range(0, double.MaxValue)]

        public decimal Cost { get; set; }

        public string? Note { get; set; }
    }
}
