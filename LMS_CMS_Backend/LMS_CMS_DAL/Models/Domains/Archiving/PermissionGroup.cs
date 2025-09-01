using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.Archiving
{
    public class PermissionGroup : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [Required(ErrorMessage = "English Name is required")]
        [StringLength(100, ErrorMessage = "English Name cannot be longer than 100 characters.")]
        public string En_Name { get; set; }

        [Required(ErrorMessage = "Arabic Name is required")]
        [StringLength(100, ErrorMessage = "Arabic Name cannot be longer than 100 characters.")]
        public string Ar_Name { get; set; }

        public ICollection<PermissionGroupEmployee> PermissionGroupEmployees { get; set; } = new HashSet<PermissionGroupEmployee>();
    }
}
