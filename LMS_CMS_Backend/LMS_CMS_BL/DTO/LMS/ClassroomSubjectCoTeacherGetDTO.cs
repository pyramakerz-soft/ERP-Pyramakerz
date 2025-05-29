using LMS_CMS_DAL.Models.Domains;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class ClassroomSubjectCoTeacherGetDTO
    {
        public long? ID { get; set; }
        public long CoTeacherID { get; set; }
        public string CoTeacherEnglishName { get; set; }
        public string CoTeacherArabicName { get; set; }
        public long ClassroomSubjectID { get; set; }
    }
}
