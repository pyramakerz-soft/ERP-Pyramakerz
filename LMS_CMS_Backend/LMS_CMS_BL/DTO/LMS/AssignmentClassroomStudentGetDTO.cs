using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class AssignmentClassroomStudentGetDTO
    {
        public long ID { get; set; } 
        public long AssignmentID { get; set; }  
        public long StudentClassroomID { get; set; }
        public long ClassroomID { get; set; }
        public long StudentID { get; set; }
        public string ClassroomName { get; set; } 
        public string StudentEnglishName { get; set; } 
        public string StudentArabicName { get; set; } 
    }
}
