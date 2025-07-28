using LMS_CMS_DAL.Models.Domains.Communication;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Communication
{
    public class NotificationGetDTO
    {
        public long ID { get; set; } 
        public string? ImageLink { get; set; }
        public string? Text { get; set; }
        public string? Link { get; set; }
        public bool IsAllowDismiss { get; set; } 
    }
}
