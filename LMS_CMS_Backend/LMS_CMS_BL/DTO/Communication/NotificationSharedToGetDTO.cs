using LMS_CMS_DAL.Models.Domains.Communication;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Communication
{
    public class NotificationSharedToGetDTO
    {
        public long ID { get; set; }
        public long UserID { get; set; }
        public string UserName { get; set; }
        public bool NotifiedOrNot { get; set; }
        public long NotificationID { get; set; }
        public long UserTypeID { get; set; }

        // Notification
        public string? ImageLink { get; set; }
        public string? Text { get; set; }
        public string? Link { get; set; }
        public bool IsAllowDismiss { get; set; } 
    }
}
