using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Maintenance
{
    public class MaintenanceEditDto
    {
        [Required]
        public long ID { get; set; }

        [Required]
        public DateOnly? Date { get; set; }

        [Required]
        public long? ItemID { get; set; }
        public string Type { get; set; } = string.Empty; 


        public long? CompanyID { get; set; }
        public long? MaintenanceEmployeeID { get; set; }

        [Required]
        public decimal? Cost { get; set; }

        public string? Note { get; set; }

    }
}
