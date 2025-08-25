using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.MaintenanceModule
{
    public class MaintenanceEmployee : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [ForeignKey("Employee")]
        public long EmployeeID { get; set; }

        // Navigation property (relationship)
        public Employee Employee { get; set; }
    }
}
