using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class SocialWorkerMedalStudentReportDTO
    {
        public long ID { get; set; }
        public long Medal { get; set; }  // SocialWorkerMedalID
        public string MedalName { get; set; } 
        public DateTime AddedAt { get; set; }
        public string AddedBy { get; set; }
    }
}
