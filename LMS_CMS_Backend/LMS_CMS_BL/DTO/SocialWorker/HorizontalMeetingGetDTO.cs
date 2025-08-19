using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class HorizontalMeetingGetDTO
    {
        public long ID { get; set; }
        public string Title { get; set; }
        public DateOnly Date { get; set; }
        public string URL { get; set; }
        public DateTime? InsertedAt { get; set; }
        public long? InsertedByUserId { get; set; }
    }
}
