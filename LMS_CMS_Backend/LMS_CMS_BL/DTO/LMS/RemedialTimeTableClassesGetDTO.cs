using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LMS_CMS_DAL.Models.Domains;

namespace LMS_CMS_BL.DTO.LMS
{
    public class RemedialTimeTableClassesGetDTO
    {
        public long ID { get; set; }

        public long RemedialTimeTableDayId { get; set; }
        public long RemedialClassroomID { get; set; }
        public string RemedialClassroomName { get; set; }
        public int NumberOfSession { get; set; }
        public long GradeID { get; set; }
        public string GradeName { get; set; }
        public long SubjectID { get; set; }
        public string SubjecEntName { get; set; }
        public string SubjectArName { get; set; }
        public long AcademicYearID { get; set; }
        public string AcademicYearName { get; set; }
        public long TeacherID { get; set; }
        public string TeacherEnName { get; set; }
        public string TeacherArName { get; set; }
    }
}
