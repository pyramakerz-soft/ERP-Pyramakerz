using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.SocialWorker;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class SocialWorkerMedalStudentGetDTO
    {
        public long ID { get; set; }
        public long StudentID { get; set; }
        public string StudentEnName { get; set; }
        public string StudentArName { get; set; }
        public long SocialWorkerMedalID { get; set; }
        public string SocialWorkerMedalName { get; set; }
        public string SocialWorkerMedalFile { get; set; }
        public long? InsertedByUserId { get; set; }
        public string InsertedByUserName { get; set; }
        public DateTime? InsertedAt { get; set; }
    }
}
