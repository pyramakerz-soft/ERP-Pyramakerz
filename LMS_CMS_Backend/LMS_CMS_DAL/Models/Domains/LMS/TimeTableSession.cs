using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class TimeTableSession : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [ForeignKey("TimeTableClassroom")]
        public long TimeTableClassroomID { get; set; }
        public TimeTableClassroom TimeTableClassroom { get; set; }
        public ICollection<TimeTableSubject> TimeTableSubjects { get; set; } = new HashSet<TimeTableSubject>();
    }
}
