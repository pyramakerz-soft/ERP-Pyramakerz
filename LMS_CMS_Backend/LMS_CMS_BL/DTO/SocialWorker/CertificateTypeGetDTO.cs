using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class CertificateTypeGetDTO
    {
        public long ID { get; set; }
        public string Name { get; set; }
        public string File { get; set; }
        public int TopSpace { get; set; }
        public int LeftSpace { get; set; }
    }
}
