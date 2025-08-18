using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class IssueTypeGetDTO
    {
        public long ID { get; set; }
        public string Name { get; set; }
        public DateTime? InsertedAt { get; set; }
        public long? InsertedByUserId { get; set; }
    }
}
