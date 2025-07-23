using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class DutyAddDto
    {
        public DateOnly Date { get; set; }
        public long ClassID { get; set; }
        public int Period { get; set; }
        public long TeacherID { get; set; }
    }
}
