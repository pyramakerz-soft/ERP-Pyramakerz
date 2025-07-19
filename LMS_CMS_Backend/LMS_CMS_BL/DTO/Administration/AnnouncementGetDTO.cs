using LMS_CMS_BL.DTO.LMS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Administration
{
    public class AnnouncementGetDTO
    {
        public long ID { get; set; }
        public string ImageLink { get; set; }
        public string Title { get; set; }
        public long? InsertedByUserId { get; set; }
        public List<AnnouncementSharedToGetDTO> AnnouncementSharedTos { get; set; } = new List<AnnouncementSharedToGetDTO>();
    }
}
