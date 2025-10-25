using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.AccountingModule
{
    public class SafeEmployee : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [ForeignKey("Employee")]
        public long EmployeeID { get; set; }
        public Employee Employee { get; set; }

        [ForeignKey("Save")]
        public long SaveID { get; set; }
        public Save Save { get; set; }
    }
}
