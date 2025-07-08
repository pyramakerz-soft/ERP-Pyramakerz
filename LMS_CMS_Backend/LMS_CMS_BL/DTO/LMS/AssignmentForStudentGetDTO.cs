using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class AssignmentForStudentGetDTO
    {
        public long ID { get; set; }
        public long AssignmentID { get; set; }
        public long StudentClassroomID { get; set; }
        public string AssignmentEnglishName { get; set; }
        public string AssignmentArabicName { get; set; }
        public float? Degree { get; set; }
        public float AssignmentDegree { get; set; }
        public DateOnly OpenDate { get; set; }
        public DateOnly DueDate { get; set; }
        public DateOnly CutOfDate { get; set; } 
        public long SubjectID { get; set; }
        public string SubjectEnglishName { get; set; }
        public string SubjectArabicName { get; set; }
        public long AssignmentTypeID { get; set; }
        public string AssignmentTypeEnglishName { get; set; }
        public string AssignmentTypeArabicName { get; set; }
        public long SubjectWeightTypeID { get; set; }
        public string SubjectWeightTypeEnglishName { get; set; }
        public string SubjectWeightTypeArabicName { get; set; }
        public bool IsVisibleToStudent { get; set; }
        public string? InsertedByUserName { get; set; }


    }
}
