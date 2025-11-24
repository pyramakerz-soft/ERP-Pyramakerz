using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class AssignmentReportDTO
    {
        public string AssignmentName { get; set; }// Using EnglishName as default; can adjust to include Arabic if needed
        public string SubjectName { get; set; }// Using en_name as default; can adjust to ar_name if needed

        public int AssignedStudents { get; set; }
        public int AttendanceStudents { get; set; }
        public int SuccessfulStudents { get; set; }
        public int FailedStudents { get; set; }
        public int PendingStudents { get; set; }

        public double SuccessRate { get; set; }
    }
}

