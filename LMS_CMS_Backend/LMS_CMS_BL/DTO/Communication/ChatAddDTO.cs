using LMS_CMS_DAL.Models.Domains.Communication;
using LMS_CMS_DAL.Models.Domains;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Communication
{
    public class ChatAddDTO
    {
        public string? Message { get; set; }  
        public long ReceiverUserTypeID { get; set; }
        public UserFilter? UserFilters { get; set; }
        public List<IFormFile>? ChatMessageAttachmentFiles { get; set; } = new List<IFormFile>(); 
    }
} 