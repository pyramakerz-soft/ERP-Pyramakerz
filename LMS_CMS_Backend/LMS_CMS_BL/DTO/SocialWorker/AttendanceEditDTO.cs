using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class AttendanceEditDTO
    {
        public long ID { get; set; }

        public DateOnly Date { get; set; }

        public List<AttendanceStudentEditDTO> AttendanceStudents { get; set; }
    }
}
