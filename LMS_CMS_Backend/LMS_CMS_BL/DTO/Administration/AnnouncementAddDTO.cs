using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Administration
{
    public class AnnouncementAddDTO
    {
        public IFormFile ImageFile { get; set; }
        public string Title { get; set; }
        public List<long> UserTypeIDs { get; set; }
    }
}
