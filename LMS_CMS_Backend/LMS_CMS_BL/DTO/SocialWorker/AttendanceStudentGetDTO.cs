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
    public class AttendanceStudentGetDTO
    {
        public long ID { get; set; }
        public string? Note { get; set; }
        public bool IsLate { get; set; }
        public bool IsPresent { get; set; }
        public int? LateTimeInMinutes { get; set; }
        public long StudentID { get; set; }
        public string StudentEnName { get; set; }
        public string StudentArName { get; set; }
        public long AttendanceID { get; set; }
        public DateTime? InsertedAt { get; set; }
        public long? InsertedByUserId { get; set; }
    }
}
