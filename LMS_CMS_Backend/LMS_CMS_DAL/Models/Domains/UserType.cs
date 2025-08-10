using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_DAL.Models.Domains.Communication;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains
{
    public class UserType
    {
        [Key]
        public long ID { get; set; }
        [Required(ErrorMessage = "Title is required")]
        [StringLength(100, ErrorMessage = "Title cannot be longer than 100 characters.")]
        public string Title { get; set; }
    
        public ICollection<AnnouncementSharedTo> AnnouncementSharedTos { get; set; } = new List<AnnouncementSharedTo>();
        public ICollection<NotificationSharedTo> NotificationSharedTos { get; set; } = new List<NotificationSharedTo>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public ICollection<ChatMessage> SenderChatMessages { get; set; } = new List<ChatMessage>();
        public ICollection<ChatMessage> ReceiverChatMessages { get; set; } = new List<ChatMessage>();
        public ICollection<Request> SenderRequests { get; set; } = new List<Request>();
        public ICollection<Request> ReceiverRequests { get; set; } = new List<Request>();

    }
}
