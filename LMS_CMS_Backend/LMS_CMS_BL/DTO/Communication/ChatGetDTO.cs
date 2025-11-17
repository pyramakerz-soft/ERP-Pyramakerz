using LMS_CMS_DAL.Models.Domains.Communication;
using LMS_CMS_DAL.Models.Domains;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Communication
{
    public class ChatGetDTO
    {
        public long ID { get; set; }
        public string Message { get; set; }
        public bool SeenOrNot { get; set; }
        public bool ForwardedOrNot { get; set; }
        public long SenderID { get; set; }
        public string SenderEnglishName { get; set; }
        public string SenderArabicName { get; set; }
        public long SenderUserTypeID { get; set; }
        public string SenderUserTypeName { get; set; }
        public long SenderConnectionStatusID { get; set; }
        public long ReceiverID { get; set; }
        public string ReceiverEnglishName { get; set; }
        public string ReceiverArabicName { get; set; }
        public long ReceiverUserTypeID { get; set; }
        public string ReceiverUserTypeName { get; set; }
        public long ReceiverConnectionStatusID { get; set; }
        public DateTime? InsertedAt { get; set; }
        public int UnreadCount { get; set; }

        public List<ChatMessageAttachmentGetDTO> ChatMessageAttachments { get; set; } = new List<ChatMessageAttachmentGetDTO>(); 
    }
}
