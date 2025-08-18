using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class AttendanceStudentEditDTO
    {
        public long ID { get; set; }
        public string? Note { get; set; }
        public bool IsLate { get; set; }
        public bool IsAbsent { get; set; }
        public int? LateTimeInMinutes { get; set; }
        public long StudentID { get; set; }
        public long AttendanceID { get; set; }
    }
}
