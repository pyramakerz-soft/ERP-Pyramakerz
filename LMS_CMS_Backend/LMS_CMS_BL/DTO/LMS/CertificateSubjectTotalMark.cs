using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class CertificateSubjectTotalMark
    {
        public long SubjectID { get; set; }
        public string SubjectEn_name { get; set; }
        public string SubjectAr_name { get; set; }
        public float Degree { get; set; }
        public float Mark { get; set; }
    }
}
