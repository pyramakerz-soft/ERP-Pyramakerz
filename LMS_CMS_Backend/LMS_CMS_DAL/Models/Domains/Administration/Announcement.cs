using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.Administration
{
    public class Announcement : AuditableEntity
    {
        [Key]
        public long ID { get; set; } 
        public string ImageLink { get; set; }
        public string Title { get; set; }

        public ICollection<AnnouncementSharedTo> AnnouncementSharedTos { get; set; } = new List<AnnouncementSharedTo>();
    }
}
