
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Archiving
{
    public class PermissionGroupDetailsAddDTO
    {
        public long PermissionGroupID { get; set; }
        public List<ArchivingTreeDetailsDTO> ArchivingTreeDetails { get; set; } = new List<ArchivingTreeDetailsDTO>();
    }
}
