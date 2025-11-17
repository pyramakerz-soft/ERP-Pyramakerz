using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class CertificateSubject
    {
        public long SubjectID { get; set; }
        public string SubjectEn_name { get; set; }
        public string SubjectAr_name { get; set; }
        public long WeightTypeId { get; set; }
        public string WeightTypeEnName { get; set; }
        public string WeightTypeArName { get; set; }
        public float Degree { get; set; }
        public float Mark { get; set; }
    }
}
