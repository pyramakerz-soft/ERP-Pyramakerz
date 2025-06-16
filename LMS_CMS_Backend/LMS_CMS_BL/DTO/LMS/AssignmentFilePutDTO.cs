using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class AssignmentFilePutDTO
    {
        public long ID { get; set; } 
        public IFormFile? FileFile { get; set; }
        public string? LinkFile { get; set; }
    }
}
