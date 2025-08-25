using LMS_CMS_DAL.Models.Domains.Communication;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Communication
{
    public class ChatMessageAttachmentGetDTO
    {
        public long ID { get; set; } 
        public long ChatMessageID { get; set; } 
        public string FileLink { get; set; }
    }
}
