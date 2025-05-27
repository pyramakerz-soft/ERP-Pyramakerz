using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class SubjectSupervisor
    {
        [Key]
        public long ID { get; set; }

        [ForeignKey("Subject")]
        public long SubjectID { get; set; }
        public Subject Subject { get; set; }

        [ForeignKey("Employee")]
        public long EmployeeID { get; set; }
        public Employee Employee { get; set; }
    }
}
