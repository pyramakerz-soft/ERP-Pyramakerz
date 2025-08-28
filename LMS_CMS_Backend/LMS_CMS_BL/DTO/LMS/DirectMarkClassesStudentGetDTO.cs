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
    public class DirectMarkClassesStudentGetDTO
    {
        public long ID { get; set; }
        public float? Degree { get; set; }
        public long DirectMarkID { get; set; }
        public string DirectMarkEnglishName { get; set; }
        public string DirectMarkArabicName { get; set; }
        public long StudentClassroomID { get; set; }
        public long StudentID { get; set; }
        public string StudentEnglishName { get; set; }
        public string StudentArabicName { get; set; }

    }
}
