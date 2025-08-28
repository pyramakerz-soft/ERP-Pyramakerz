using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class CertificateSubject
    {
        public long ID { get; set; }
        public string en_name { get; set; }
        public string ar_name { get; set; }
        public List<CertificateDegree> Marks { get; set; } 

    }
}
