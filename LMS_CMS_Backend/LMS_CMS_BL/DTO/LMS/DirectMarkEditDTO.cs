using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class DirectMarkEditDTO
    {
        public long ID { get; set; }
        public string EnglishName { get; set; }
        public string ArabicName { get; set; }
        public long SchoolID { get; set; }
        public float Mark { get; set; }
        public DateOnly Date { get; set; }
        public List<long>? classids { get; set; }
        public bool IsSummerCourse { get; set; }
        public long SubjectWeightTypeID { get; set; }
    }
}
