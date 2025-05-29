using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class StudentClassroomPutDTO
    {
        public long ID { get; set; }
        public long StudentID { get; set; }
        public long ClassID { get; set; }
    }
}
