using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class AssignmentReportDTO
    {
        public long ID { get; set; }
        public string AssignmentName { get; set; } // Using EnglishName as default; can adjust to include Arabic if needed
        public long SubjectID { get; set; }
        public string SubjectName { get; set; } // Using en_name as default; can adjust to include ar_name if needed
        public int AttendanceNumber { get; set; }
        public int NumberSuccessful { get; set; }
        public int NumberFailed { get; set; }
        public int Assigned { get; set; } 
        public int Absent { get; set; }  
    }
}
