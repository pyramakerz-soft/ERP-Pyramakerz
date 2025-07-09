using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class TimeTableClassroom : AuditableEntity
    {
        [Key]
        public long ID { get; set; }


        [ForeignKey("Day")]
        public long? DayId { get; set; }
        public Days? Day { get; set; }


        [ForeignKey("TimeTable")]
        public long TimeTableID { get; set; }
        public TimeTable TimeTable { get; set; }


        [ForeignKey("Classroom")]
        public long ClassroomID { get; set; }
        public Classroom Classroom { get; set; }

        public ICollection<TimeTableSession> TimeTableSessions { get; set; } = new HashSet<TimeTableSession>();
    }
}
