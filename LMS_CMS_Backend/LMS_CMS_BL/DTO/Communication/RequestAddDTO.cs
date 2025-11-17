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
    public class RequestAddDTO
    { 
        public string Message { get; set; }
        public string? Link { get; set; }
        public IFormFile? FileFile { get; set; } 
        public long ReceiverID { get; set; }
        public long ReceiverUserTypeID { get; set; } 

        // If Parent is Sending request to teacher send for which student
        public long? StudentID { get; set; }
    }
}
