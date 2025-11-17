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
    public class SocialWorkerMedalStudent : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [ForeignKey("Student")]
        public long StudentID { get; set; }
        public Student Student { get; set; }

        [ForeignKey("SocialWorkerMedal")]
        public long SocialWorkerMedalID { get; set; }
        public SocialWorkerMedal SocialWorkerMedal { get; set; }
    }
}
