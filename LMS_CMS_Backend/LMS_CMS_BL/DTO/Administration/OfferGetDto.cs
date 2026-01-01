using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Administration
{
    public class OfferGetDto
    {
        public long ID { get; set; }
        public string? DepartmentName { get; set; }
        public string? TitleName { get; set; }
        public DateTime TimeLogged { get; set; }
        public string? UploadedFilePath { get; set; }  
        public string? FileName { get; set; }
    }
    public class OfferAddDto
    {
        [Required]
        public long DepartmentID { get; set; }

        [Required]
        public long TitleID { get; set; }
        public IFormFile? UploadedFile { get; set; }
    }
}
