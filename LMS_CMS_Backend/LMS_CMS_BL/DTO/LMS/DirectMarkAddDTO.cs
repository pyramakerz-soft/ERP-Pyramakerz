using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class DirectMarkAddDTO
    {
        public string EnglishName { get; set; }
        public string ArabicName { get; set; }
        public float Mark { get; set; }
        public DateOnly Date { get; set; }
        public long SchoolID { get; set; }
        public long SubjectID { get; set; }
        public long SubjectWeightTypeID { get; set; }
        public bool AllClasses { get; set; }
        public List<long>? classids { get; set; }
        public bool IsSummerCourse { get; set; }

    }
}
