using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class DutyGetDto
    {
        public long ID { get; set; }
        public long TimeTableSessionID { get; set; }
        public DateOnly Date { get; set; }
        public long ClassID { get; set; }
        public string ClassName { get; set; }
        public long SchoolID { get; set; }
        public string SchoolName { get; set; }
        public int Period { get; set; }
        public long TeacherID { get; set; }
        public string TeacherName { get; set; }
    }
}
