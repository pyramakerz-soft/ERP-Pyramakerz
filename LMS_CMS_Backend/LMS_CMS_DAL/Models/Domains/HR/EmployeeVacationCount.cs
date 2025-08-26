using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.HR
{
    public class EmployeeVacationCount : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public int Ballance { get; set; }
        public int Used { get; set; }

        [ForeignKey("Employee")]
        public long EmployeeID { get; set; }
        public Employee Employee { get; set; }

        [ForeignKey("VacationTypes")]
        public long VacationTypesID { get; set; }
        public VacationTypes VacationTypes { get; set; }
    }
}
