using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.SocialWorker
{
    public class AppointmentStatus : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public string Name { get; set; }
        public ICollection<AppointmentParent> AppointmentParents { get; set; } = new HashSet<AppointmentParent>();
    }
}
