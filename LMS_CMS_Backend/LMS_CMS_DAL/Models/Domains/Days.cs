using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains
{
    public class Days
    {
        [Key]
        public long ID { get; set; }
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string Name { get; set; }

        public ICollection<EmployeeDays> EmployeeDays { get; set; } = new HashSet<EmployeeDays>();
        public ICollection<School> StartDaySchool { get; set; } = new HashSet<School>();
        public ICollection<School> EndDaySchool { get; set; } = new HashSet<School>();
        public ICollection<LessonLive> LessonLives { get; set; } = new HashSet<LessonLive>();
        public ICollection<TimeTableClassroom> TimeTableClassrooms { get; set; } = new HashSet<TimeTableClassroom>();
        public ICollection<RemedialTimeTableDay> RemedialTimeTableDays { get; set; } = new HashSet<RemedialTimeTableDay>();
    }
}
