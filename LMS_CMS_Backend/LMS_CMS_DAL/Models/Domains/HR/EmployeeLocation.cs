using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.HR
{
    public class EmployeeLocation : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [ForeignKey("Location")]
        public long LocationID { get; set; }
        public Location Location { get; set; }

        [ForeignKey("Employee")]
        public long EmployeeID { get; set; }
        public Employee Employee { get; set; }
    }
}
