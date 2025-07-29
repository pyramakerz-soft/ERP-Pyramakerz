using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class TimeTableSessionGetDto
    {
        public long ID { get; set; }
        public long TimeTableClassroomID { get; set; }
        public int PeriodIndex { get; set; } // <- important for ordering
        public ICollection<TimeTableSubjectGetDto> TimeTableSubjects { get; set; }

    }
}
