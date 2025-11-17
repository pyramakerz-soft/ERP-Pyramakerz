using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Archiving
{
    public class ArchivingTreeDetailsDTO
    {
        public long ArchivingTreeID { get; set; }
        public bool Allow_Delete { get; set; }
        public bool Allow_Delete_For_Others { get; set; }
    }
}
