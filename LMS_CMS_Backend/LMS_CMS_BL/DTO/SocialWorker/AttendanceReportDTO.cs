using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class AttendanceReportDTO
    {
        public long ID { get; set; } // From AttendanceStudent
        public DateOnly Date { get; set; } // From Attendance
        public long StudentID { get; set; } // From AttendanceStudent
        public string? studentEnName { get; set; }
        public string? studentArName { get; set; }

        public string? Notes { get; set; } // From AttendanceStudent (Note)
        public bool IsLate { get; set; } // From AttendanceStudent
        public int? LateTimeInMinutes { get; set; } // From AttendanceStudent
    }
}
