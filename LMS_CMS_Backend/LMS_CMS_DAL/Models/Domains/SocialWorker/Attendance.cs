using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.SocialWorker
{
    public class Attendance : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public DateOnly Date { get; set; }

        [ForeignKey("AcademicYear")]
        public long AcademicYearID { get; set; }
        public AcademicYear AcademicYear { get; set; }

        [ForeignKey("Classroom")]
        public long ClassroomID { get; set; }
        public Classroom Classroom { get; set; }
        public ICollection<AttendanceStudent> AttendanceStudents { get; set; } = new HashSet<AttendanceStudent>();

    }
}
