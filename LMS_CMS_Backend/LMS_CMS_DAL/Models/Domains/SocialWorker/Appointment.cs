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
    public class Appointment : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public string Title { get; set; }
        public DateOnly Date { get; set; }
        public DateOnly DueDateToParentToAccept { get; set; }

        [ForeignKey("School")]
        public long SchoolID { get; set; }
        public School School { get; set; }
        public ICollection<AppointmentParent> AppointmentParents { get; set; } = new HashSet<AppointmentParent>();
        public ICollection<AppointmentGrade> AppointmentGrades { get; set; } = new HashSet<AppointmentGrade>();

    }
}
