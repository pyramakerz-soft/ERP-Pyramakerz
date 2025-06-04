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
        public string? LinkFile { get; set; } 
        public long SubjectID { get; set; }  
        public string SubjectName { get; set; }  
        public long AssignmentTypeID { get; set; } 
        //public ICollection<AssignmentClassroomStudentGetDTO> AssignmentClassroomStudents { get; set; } = new HashSet<AssignmentClassroomStudentGetDTO>();
    }
}
