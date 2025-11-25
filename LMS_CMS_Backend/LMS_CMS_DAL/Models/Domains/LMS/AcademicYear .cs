using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;
using LMS_CMS_DAL.Models.Domains.SocialWorker;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class AcademicYear : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string Name { get; set; }
        public DateOnly DateFrom { get; set; }
        public DateOnly DateTo { get; set; }
        public bool IsActive { get; set; }

        [ForeignKey("School")]
        public long SchoolID { get; set; }
        public School School { get; set; }

        public DateOnly? SummerCourseDateFrom { get; set; }
        public DateOnly? SummerCourseDateTo { get; set; }

        public ICollection<Semester> Semesters { get; set; } = new HashSet<Semester>();
        public ICollection<Classroom> Classrooms { get; set; } = new HashSet<Classroom>();
        public ICollection<Test> Tests { get; set; } = new HashSet<Test>();
        public ICollection<InterviewTime> InterviewTimes { get; set; } = new HashSet<InterviewTime>();
        public ICollection<StudentGrade> StudentGrades { get; set; } = new HashSet<StudentGrade>();
        public ICollection<TimeTable> TimeTables { get; set; } = new HashSet<TimeTable>();
        public ICollection<RemedialTimeTable> RemedialTimeTables { get; set; } = new HashSet<RemedialTimeTable>();
        public ICollection<RemedialClassroom> RemedialClassrooms { get; set; } = new HashSet<RemedialClassroom>();
        public ICollection<Attendance> Attendances { get; set; } = new HashSet<Attendance>();
        public ICollection<FailedStudents> FailedStudents { get; set; } = new HashSet<FailedStudents>();
        public ICollection<Assignment> Assignments { get; set; } = new HashSet<Assignment>();
        public ICollection<DirectMark> DirectMarks { get; set; } = new HashSet<DirectMark>();

    }
}
