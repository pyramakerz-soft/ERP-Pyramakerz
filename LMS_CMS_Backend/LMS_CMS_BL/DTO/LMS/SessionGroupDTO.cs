using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class SessionGroupDTO
    {
        public long SessionId { get; set; }
        public int PeriodIndex { get; set; }
        public long? DutyTeacherId { get; set; }
        public string DutyTeacherName { get; set; }
        public List<SubjectTeacherDTO> Subjects { get; set; }

    }
}
