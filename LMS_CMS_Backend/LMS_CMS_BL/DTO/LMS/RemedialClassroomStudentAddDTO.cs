using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class RemedialClassroomStudentAddDTO
    {
        public long RemedialClassroomID { get; set; }
        public List<long> StudentIds { get; set; }

    }
}
