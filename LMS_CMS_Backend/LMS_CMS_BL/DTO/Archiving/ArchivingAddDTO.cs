using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace LMS_CMS_BL.DTO.Archiving
{
    public class ArchivingAddDTO
    {  
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string Name { get; set; }
        public IFormFile? FileFile { get; set; } 
        public long? ArchivingTreeParentID { get; set; }
    }
}
