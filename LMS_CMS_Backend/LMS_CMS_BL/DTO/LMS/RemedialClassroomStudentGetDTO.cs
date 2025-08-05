using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class RemedialClassroomStudentGetDTO
    {
        public long ID { get; set; }

        public long RemedialClassroomID { get; set; }
        public string RemedialClassroomName { get; set; }
        public long StudentID { get; set; }
        public string StudentEnName { get; set; }
        public string StudentArName { get; set; }
    }
}
