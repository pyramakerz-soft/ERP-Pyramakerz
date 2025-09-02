using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.Archiving
{
    public class PermissionGroupDetails : AuditableEntity
    {
        [Key]
        public long ID { get; set; } 
        public bool Allow_Delete { get; set; } 
        public bool Allow_Delete_For_Others { get; set; }

        [ForeignKey("ArchivingTree")]
        public long ArchivingTreeID { get; set; }
        public ArchivingTree ArchivingTree { get; set; }

        [ForeignKey("PermissionGroup")]
        public long PermissionGroupID { get; set; }
        public PermissionGroup PermissionGroup { get; set; }
    }
}
