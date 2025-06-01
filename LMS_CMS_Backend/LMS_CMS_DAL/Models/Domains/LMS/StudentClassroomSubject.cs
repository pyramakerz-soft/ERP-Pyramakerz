using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class StudentClassroomSubject : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public bool Hide { get; set; }
        [ForeignKey("StudentClassroom")]
        public long StudentClassroomID { get; set; }
        public StudentClassroom StudentClassroom { get; set; }
        [ForeignKey("Subject")]
        public long SubjectID { get; set; }
        public Subject Subject { get; set; }
    }
}
