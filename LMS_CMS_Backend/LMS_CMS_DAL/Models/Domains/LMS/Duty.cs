using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class Duty : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public DateOnly Date { get; set; }

        [ForeignKey("TimeTableSession")]
        public long TimeTableSessionID { get; set; }
        public TimeTableSession TimeTableSession { get; set; }

        [ForeignKey("Teacher")]
        public long TeacherID { get; set; }
        public Employee Teacher { get; set; }
    }
}
