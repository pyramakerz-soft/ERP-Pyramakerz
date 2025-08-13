using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class CertificateTypeEditDTO
    {
        public long ID { get; set; }
        public string Name { get; set; }
        public IFormFile NewFile { get; set; }
        public int TopSpace { get; set; }
        public int LeftSpace { get; set; }

    }
}
