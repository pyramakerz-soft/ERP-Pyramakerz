using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LMS_CMS_DAL.Models.Domains.LMS;

namespace LMS_CMS_DAL.Models.Domains.SocialWorker
{
    public class AppointmentGrade : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [ForeignKey("Appointment")]
        public long AppointmentID { get; set; }
        public Appointment Appointment { get; set; }

        [ForeignKey("Grade")]
        public long GradeID { get; set; }
        public Grade Grade { get; set; }
    }
}
