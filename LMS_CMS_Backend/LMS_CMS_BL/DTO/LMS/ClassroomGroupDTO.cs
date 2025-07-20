using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class ClassroomGroupDTO
    {
        public long ClassroomId { get; set; }
        public string ClassroomName { get; set; }
        public List<SessionGroupDTO> Sessions { get; set; }
    }
}
