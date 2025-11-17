using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class DirectMarkGetDTO 
    {
        public long ID { get; set; }
        public string EnglishName { get; set; }
        public string ArabicName { get; set; }
        public float Mark { get; set; }
        public DateOnly Date { get; set; }
        public long SubjectID { get; set; }
        public string SubjectEnglishName { get; set; }
        public string SubjectArabicName { get; set; }
        public long SchoolID { get; set; }
        public string SchoolName { get; set; }
        public long GradeID { get; set; }
        public string GradeName { get; set; }
        public long SubjectWeightTypeID { get; set; }
        public string SubjectWeightTypeEnglishName { get; set; }
        public string SubjectWeightTypeArabicName { get; set; }
        public long? InsertedByUserId { get; set; }
        public string? InsertedByUserName { get; set; }
        public bool IsSummerCourse { get; set; }
        public List<DirectMarkClassesStudentGetDTO> DirectMarkClassesStudent { get; set; } = new List<DirectMarkClassesStudentGetDTO>();
        public List<DirectMarkClassesGetDTO> DirectMarkClasses { get; set; } = new List<DirectMarkClassesGetDTO>();
        public long? AcademicYearID { get; set; }

    }
}
