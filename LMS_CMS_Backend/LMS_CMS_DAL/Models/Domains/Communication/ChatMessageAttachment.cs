using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.Communication
{
    public class ChatMessageAttachment 
    {
        [Key]
        public long ID { get; set; } 

        [ForeignKey("ChatMessage")]
        public long ChatMessageID { get; set; }
        public ChatMessage ChatMessage { get; set; }

        public string FileLink { get; set; }
    }
}
