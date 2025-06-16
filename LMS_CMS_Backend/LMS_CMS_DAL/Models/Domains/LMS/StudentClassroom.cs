using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class StudentClassroom : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        [ForeignKey("Student")]
        public long StudentID { get; set; } 
        public Student Student { get; set; } 
        [ForeignKey("Classroom")]
        public long ClassID { get; set; } 
        public Classroom Classroom { get; set; }
        public ICollection<StudentClassroomSubject> StudentClassroomSubjects { get; set; } = new HashSet<StudentClassroomSubject>();
        public ICollection<DirectMarkClassroomStudent> DirectMarkClassroomStudents { get; set; } = new HashSet<DirectMarkClassroomStudent>();
        public ICollection<AssignmentStudent> AssignmentStudents { get; set; } = new HashSet<AssignmentStudent>();
    }
}
