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
        public ICollection<DirectMarkClassesStudent> DirectMarkClassesStudent { get; set; } = new HashSet<DirectMarkClassesStudent>();
        public ICollection<AssignmentStudent> AssignmentStudents { get; set; } = new HashSet<AssignmentStudent>();
        public ICollection<AssignmentStudentIsSpecific> AssignmentStudentIsSpecifics { get; set; } = new HashSet<AssignmentStudentIsSpecific>();
        public ICollection<DiscussionRoomStudentClassroom> DiscussionRoomStudentClassrooms { get; set; } = new List<DiscussionRoomStudentClassroom>();
    }
}
