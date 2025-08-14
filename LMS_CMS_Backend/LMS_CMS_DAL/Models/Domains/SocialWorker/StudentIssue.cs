using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.SocialWorker
{
    public class StudentIssue : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public string? Details { get; set; }
        public DateOnly Date { get; set; }

        [ForeignKey("Student")]
        public long StudentID { get; set; }
        public Student Student { get; set; }

        [ForeignKey("Classroom")]
        public long ClassroomID { get; set; }
        public Classroom Classroom { get; set; }

        [ForeignKey("IssuesType")]
        public long IssuesTypeID { get; set; }
        public IssuesType IssuesType { get; set; }

    }
}
