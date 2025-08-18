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
    public class StudentIssueAddDTO
    {
        public string? Details { get; set; }
        public DateOnly Date { get; set; }
        public long StudentID { get; set; }
        public long ClassroomID { get; set; }
        public long IssuesTypeID { get; set; }
    }
}
