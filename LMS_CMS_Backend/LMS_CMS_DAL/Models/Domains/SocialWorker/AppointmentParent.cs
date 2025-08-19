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
    public class AppointmentParent : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [ForeignKey("Appointment")]
        public long AppointmentID { get; set; }
        public Appointment Appointment { get; set; }

        [ForeignKey("Parent")]
        public long ParentID { get; set; }
        public Parent Parent { get; set; }

        [ForeignKey("AppointmentStatus")]
        public long AppointmentStatusID { get; set; }
        public AppointmentStatus AppointmentStatus { get; set; }

    }
}
