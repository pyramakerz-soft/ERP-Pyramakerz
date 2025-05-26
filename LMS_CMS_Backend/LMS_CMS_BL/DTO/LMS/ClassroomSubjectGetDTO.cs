using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class ClassroomSubjectGetDTO
    {
        public long ID { get; set; }
        public bool Hide { get; set; }
        public long TeacherID { get; set; }
        public string TeacherEnglishName { get; set; }
        public string TeacherArabicName { get; set; }
        public long SubjectID { get; set; }
        public string SubjectEnglishName { get; set; }
        public string SubjectArabicName { get; set; }
        public long ClassroomID { get; set; }
        public List<ClassroomSubjectCoTeacherGetDTO> ClassroomSubjectCoTeachers { get; set; } = new List<ClassroomSubjectCoTeacherGetDTO>();

        public long? InsertedByUserId { get; set; }
    }
}
