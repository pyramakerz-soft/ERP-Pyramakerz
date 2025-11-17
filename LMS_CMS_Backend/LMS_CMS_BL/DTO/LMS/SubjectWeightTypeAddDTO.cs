using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class SubjectWeightTypeAddDTO
    {
        public long WeightTypeID { get; set; }
        public long SubjectID { get; set; }
        public float Weight { get; set; }
    }
}
