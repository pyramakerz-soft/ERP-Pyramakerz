using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Communication
{
    public class ChatForwardDTO
    { 
        public long ChatMessageID { get; set; }
        public long ReceiverUserTypeID { get; set; }
        public UserFilter? UserFilters { get; set; }
    }
}
