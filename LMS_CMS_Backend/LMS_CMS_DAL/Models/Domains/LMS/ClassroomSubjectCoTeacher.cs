using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class ClassroomSubjectCoTeacher : AuditableEntity
    {
        [Key]
        public long ID { get; set; } 

        [ForeignKey("CoTeacher")]
        public long CoTeacherID { get; set; }
        public Employee CoTeacher { get; set; }

        [ForeignKey("ClassroomSubject")]
        public long ClassroomSubjectID { get; set; }
        public ClassroomSubject ClassroomSubject { get; set; }
    }
}
