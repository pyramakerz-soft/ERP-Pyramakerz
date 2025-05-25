using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class ClassroomSubject : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public bool Hide { get; set; }

        [ForeignKey("Teacher")]
        public long? TeacherID { get; set; }
        public Employee? Teacher { get; set; }
        
        [ForeignKey("Classroom")]
        public long ClassroomID { get; set; }
        public Classroom Classroom { get; set; }

        [ForeignKey("Subject")]
        public long SubjectID { get; set; }
        public Subject Subject { get; set; }

        public ICollection<ClassroomSubjectCoTeacher> ClassroomSubjectCoTeachers { get; set; } = new HashSet<ClassroomSubjectCoTeacher>();
    }
}
