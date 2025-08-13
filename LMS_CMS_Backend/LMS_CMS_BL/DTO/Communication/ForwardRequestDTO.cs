using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Communication
{
    public class ForwardRequestDTO
    {
        public long RequestID { get; set; }
        public long ForwardToID { get; set; }
    }
}
