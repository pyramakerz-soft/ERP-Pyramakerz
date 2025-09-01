using LMS_CMS_DAL.Models.Domains.AccountingModule;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.Archiving
{
    public class ArchivingTree : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string Name { get; set; }
        public string? FileLink { get; set; }

        [ForeignKey("ArchivingTreeParent")] 
        public long? ArchivingTreeParentID { get; set; }
        public ArchivingTree? ArchivingTreeParent { get; set; }

        public ICollection<ArchivingTree> ChildArchivingTrees { get; set; } = new List<ArchivingTree>();
        public ICollection<PermissionGroupDetails> PermissionGroupDetails { get; set; } = new List<PermissionGroupDetails>();
    }
}
