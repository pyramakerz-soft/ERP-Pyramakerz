using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class StudentIssueReportDTO
    {
        public long ID { get; set; }
        public DateOnly Date { get; set; }
        public long StudentID { get; set; }
        public string StudentName { get; set; } // Will use Student.en_name or Student.ar_name
        public IssuesTypeDTO IssuesType { get; set; }
        public string? Details { get; set; }
    }

    public class IssuesTypeDTO
    {
        public long ID { get; set; }
        public string Name { get; set; }
    }
}
