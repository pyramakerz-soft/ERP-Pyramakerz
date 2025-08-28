using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.ViolationModule
{
    public class Violation : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public string? Details { get; set; }
        public string? Attach { get; set; }  //7
        public DateOnly Date { get; set; }

        [ForeignKey("ViolationType")]
        public long ViolationTypeID { get; set; }
        public ViolationType ViolationType { get; set; }
        [ForeignKey("Employee")]
        public long EmployeeID { get; set; }
        public Employee Employee { get; set; }
    }
}
