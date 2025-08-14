using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class StudentIssueEditDTO
    {
        public long ID { get; set; }
        public string? Details { get; set; }
        public DateOnly Date { get; set; }
        public long StudentID { get; set; }
        public long ClassroomID { get; set; }
        public long IssuesTypeID { get; set; }

    }
}
