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
    public class AssignmentGetDTO
    {
        public long ID { get; set; } 
        public string EnglishName { get; set; } 
        public string ArabicName { get; set; }
        public float Mark { get; set; }
        public DateOnly OpenDate { get; set; }
        public DateOnly DueDate { get; set; }
        public DateOnly CutOfDate { get; set; }
        public bool IsSpecificStudents { get; set; }
        public bool IsVisibleToStudent { get; set; }
        public string? LinkFile { get; set; } 
        public long SubjectID { get; set; }  
        public string SubjectEnglishName { get; set; }  
        public string SubjectArabicName { get; set; }  
        public long AssignmentTypeID { get; set; }
        public string AssignmentTypeEnglishName { get; set; }  
        public string AssignmentTypeArabicName { get; set; }
        public long SubjectWeightTypeID { get; set; }
        public string SubjectWeightTypeEnglishName { get; set; }
        public string SubjectWeightTypeArabicName { get; set; }
        public List<AssignmentStudentGetDTO> AssignmentStudents { get; set; } = new List<AssignmentStudentGetDTO>();
        public List<AssignmentQuestionGetDTO> AssignmentQuestions { get; set; } = new List<AssignmentQuestionGetDTO>();
        public List<AssignmentStudentIsSpecificGetDTO> AssignmentStudentIsSpecifics { get; set; } = new List<AssignmentStudentIsSpecificGetDTO>();
        public long? InsertedByUserId { get; set; } 
    }
}
