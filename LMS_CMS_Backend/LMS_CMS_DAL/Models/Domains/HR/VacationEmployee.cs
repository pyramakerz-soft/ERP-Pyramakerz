using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.HR
{
    public class VacationEmployee : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public DateOnly Date { get; set; }
        public string? Notes { get; set; }
        public bool HalfDay { get; set; }
        public DateOnly DateFrom { get; set; }
        public DateOnly? DateTo { get; set; }

        [ForeignKey("Employee")]
        public long EmployeeID { get; set; }
        public Employee Employee { get; set; }

        [ForeignKey("VacationTypes")]
        public long VacationTypesID { get; set; }
        public VacationTypes VacationTypes { get; set; }

    }
}
