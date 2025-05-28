using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class StudentClassroomGetDTO
    {
        public long ID { get; set; }
        public long StudentID { get; set; }
        public string StudentEnglishName { get; set; }
        public string StudentArabicName { get; set; }
        public long ClassID { get; set; }
        public string ClassName { get; set; }
        public long InsertedByUserId { get; set; }
    }
}
