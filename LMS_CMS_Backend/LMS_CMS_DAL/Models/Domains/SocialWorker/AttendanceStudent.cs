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
    public class AttendanceStudent : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public string? Note { get; set; }
        public bool IsLate { get; set; }
        public bool IsPresent { get; set; }
        public int? LateTimeInMinutes { get; set; }

        [ForeignKey("Student")]
        public long StudentID { get; set; }
        public Student Student { get; set; }

        [ForeignKey("Attendance")]
        public long AttendanceID { get; set; }
        public Attendance Attendance { get; set; }

    }
}
