using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class HorizontalMeetingAddDTO
    {
        public long? ID { get; set; }
        public string Title { get; set; }
        public DateOnly Date { get; set; }
        public string URL { get; set; }
    }
}
