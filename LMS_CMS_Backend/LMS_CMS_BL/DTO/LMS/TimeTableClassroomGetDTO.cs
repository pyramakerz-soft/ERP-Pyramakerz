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
    public class TimeTableClassroomGetDTO
    {
        public long ID { get; set; }

        public long DayId { get; set; }
        public string DayName { get; set; }
        public long TimeTableID { get; set; }
        public string TimeTableName { get; set; }
        public long ClassroomID { get; set; }
        public string ClassroomName { get; set; }
        public long GradeId { get; set; }
        public string GradeName { get; set; }
        public ICollection<TimeTableSessionGetDto> TimeTableSessions { get; set; }

    }
}
