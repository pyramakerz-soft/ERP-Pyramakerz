using LMS_CMS_DAL.Models.Domains.Archiving;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Archiving
{
    public class PermissionGroupDetailsGetDTO
    {
        public long ID { get; set; }
        public bool Allow_Delete { get; set; }
        public bool Allow_Delete_For_Others { get; set; } 
        public long ArchivingTreeID { get; set; }  
        public long PermissionGroupID { get; set; }
    }
}
