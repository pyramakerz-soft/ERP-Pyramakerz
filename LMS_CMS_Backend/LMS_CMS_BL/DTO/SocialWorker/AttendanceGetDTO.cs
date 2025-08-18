using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LMS_CMS_DAL.Models.Domains.SocialWorker;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class AttendanceGetDTO
    {
        public long ID { get; set; }
        public DateOnly Date { get; set; }
        public long AcademicYearID { get; set; }
        public string AcademicYearName { get; set; }
        public long SchoolID { get; set; }
        public string SchoolName { get; set; }
        public long GradeID { get; set; }
        public string GradeName { get; set; }
        public long ClassroomID { get; set; }
        public string ClassroomName { get; set; }
        public List<AttendanceStudentGetDTO> AttendanceStudents { get; set; } 
        public DateTime? InsertedAt { get; set; }
        public long? InsertedByUserId { get; set; }
    }
}
