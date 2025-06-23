using System.ComponentModel.DataAnnotations;

namespace LMS_CMS_DAL.Models.Domains.ETA
{
    public class CertificatesIssuerName : AuditableEntity
    {
        [Key]
        public int ID { get; set; }
        public string Name { get; set; }
    }
}
