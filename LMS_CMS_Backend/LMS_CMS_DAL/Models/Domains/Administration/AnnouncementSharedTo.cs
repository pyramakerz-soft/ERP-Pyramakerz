using LMS_CMS_DAL.Models.Domains.Administration;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.Administration
{
    public class AnnouncementSharedTo : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        
        [ForeignKey("Announcement")]
        public long AnnouncementID { get; set; }
        public Announcement Announcement { get; set; }
        
        [ForeignKey("UserType")]
        public long UserTypeID { get; set; }
        public UserType UserType { get; set; }
    }
}
