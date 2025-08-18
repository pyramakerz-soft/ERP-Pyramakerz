using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class AttendanceAddDTO
    {
        public DateOnly Date { get; set; }
        public long AcademicYearID { get; set; }
        public long ClassroomID { get; set; }
        public List<AttendanceStudentAddDTO> AttendanceStudents { get; set; }
    }
}
