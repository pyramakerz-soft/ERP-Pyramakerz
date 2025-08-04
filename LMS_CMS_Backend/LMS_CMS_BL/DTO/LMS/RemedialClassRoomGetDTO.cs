using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class RemedialClassRoomGetDTO
    {
        [Key]
        public long ID { get; set; }
        public string Name { get; set; }
        public long SubjectID { get; set; }
        public string SubjectEnglishName { get; set; }
        public string SubjectArabicName { get; set; }
        public long AcademicYearID { get; set; }
        public string AcademicYearName { get; set; }
        public long SchoolID { get; set; }
        public string SchoolName { get; set; }
        public long GradeID { get; set; }
        public string GradeName { get; set; }
        public long TeacherID { get; set; }
        public string TeacherName { get; set; }
        public DateTime? InsertedAt { get; set; }
        public List<RemedialClassroomStudentGetDTO> RemedialClassroomStudents { get; set; }
    }
}
