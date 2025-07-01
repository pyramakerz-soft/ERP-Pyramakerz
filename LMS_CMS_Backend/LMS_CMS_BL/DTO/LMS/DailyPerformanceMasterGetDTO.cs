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
    public class DailyPerformanceMasterGetDTO
    {
        public long ID { get; set; }
        public long SubjectID { get; set; }
        public string SubjectName { get; set; }
        public long ClassroomID { get; set; }
        public string ClassroomName { get; set; }
        public long GradeID { get; set; }
        public string GradeName { get; set; }
        public DateTime? InsertedAt { get; set; }
        public List<DailyPerformanceGetDTO> DailyPerformances { get; set; }

    }
}
