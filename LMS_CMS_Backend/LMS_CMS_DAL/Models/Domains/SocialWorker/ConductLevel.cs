using LMS_CMS_DAL.Models.Domains.BusModule;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.SocialWorker
{
    public class ConductLevel : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string Name { get; set; }
        public ICollection<ConductType> ConductTypes { get; set; } = new HashSet<ConductType>();

    }
}
