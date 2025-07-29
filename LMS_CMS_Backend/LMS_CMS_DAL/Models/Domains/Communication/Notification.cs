using LMS_CMS_DAL.Models.Domains.Administration;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.Communication
{
    public class Notification : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public string? ImageLink { get; set; }
        public string? Text { get; set; }
        public string? Link { get; set; }
        public bool IsAllowDismiss { get; set; }

        [ForeignKey("UserType")]
        public long? UserTypeID { get; set; }
        public UserType? UserType { get; set; }

        public ICollection<NotificationSharedTo> NotificationSharedTos { get; set; } = new List<NotificationSharedTo>();
    }
}
