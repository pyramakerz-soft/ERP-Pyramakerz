using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.SocialWorker;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class StudentIssueGetDTO
    {
        public long ID { get; set; }
        public string? Details { get; set; }
        public DateOnly Date { get; set; }
        public long StudentID { get; set; }
        public string StudentEnName { get; set; }
        public string StudentArName { get; set; }
        public long ClassroomID { get; set; }
        public string ClassroomName { get; set; }
        public long GradeID { get; set; }
        public string GradeName { get; set; }
        public long SchoolID { get; set; }
        public string SchoolName { get; set; }
        public long IssuesTypeID { get; set; }
        public string IssuesTypeName { get; set; }

    }
}
