using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class RemedialTimeTableEditDTO
    {
        public long ID { get; set; }
        public ICollection<long> RemedialClassroomIds { get; set; }

    }
}
