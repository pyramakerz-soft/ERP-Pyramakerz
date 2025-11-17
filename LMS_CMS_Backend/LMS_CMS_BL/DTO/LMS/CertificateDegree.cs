using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class CertificateDegree
    {
        public long WeightTypeId { get; set; }
        public string WeightTypeEnName { get; set; }
        public string WeightTypeArName { get; set; }
        public float Degree { get; set; }
        public float Mark { get; set; }
    }
}
