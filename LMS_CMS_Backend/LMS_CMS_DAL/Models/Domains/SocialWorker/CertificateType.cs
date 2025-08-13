using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.SocialWorker
{
    public class CertificateType : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public string Name { get; set; }
        public string File { get; set; }
        public int TopSpace { get; set; }
        public int LefySpace { get; set; }
        public ICollection<CertificateStudent> CertificateStudent { get; set; } = new HashSet<CertificateStudent>();

    }
}
