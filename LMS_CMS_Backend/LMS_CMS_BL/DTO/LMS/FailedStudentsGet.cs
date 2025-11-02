using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class FailedStudentsGet
    {
        public long ID { get; set; } 
        public long StudentID { get; set; }  
        public string StudentEnglishName { get; set; }
        public string StudentArabicName { get; set; }
        public long GradeID { get; set; }  
        public string GradeName { get; set; }
        public long SubjectID { get; set; }  
        public string SubjectEnglishName { get; set; }
        public string SubjectArabicName { get; set; }
        public long AcademicYearID { get; set; }
        public string AcademicYearName { get; set; }
    }
}
