using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class RemedialClassroom : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string Name { get; set; }

        [ForeignKey("Subject")]
        public long SubjectID { get; set; }
        public Subject Subject { get; set; }

        [ForeignKey("AcademicYear")]
        public long AcademicYearID { get; set; }
        public AcademicYear AcademicYear { get; set; }

        [ForeignKey("Teacher")]
        public long TeacherID { get; set; }
        public Employee Teacher { get; set; }
        public ICollection<RemedialClassroomStudent> RemedialClassroomStudents { get; set; } = new HashSet<RemedialClassroomStudent>();
        public ICollection<RemedialTimeTableClasses> RemedialTimeTableClasses { get; set; } = new HashSet<RemedialTimeTableClasses>();
    }
}
