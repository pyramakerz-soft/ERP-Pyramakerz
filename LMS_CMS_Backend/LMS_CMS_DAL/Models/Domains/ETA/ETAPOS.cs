using System.ComponentModel.DataAnnotations;

namespace LMS_CMS_DAL.Models.Domains.ETA
{
    public class ETAPOS : AuditableEntity
    {
        [Key]
        public int ID { get; set; }
        public string ClientID { get; set; }
        public string ClientSecret { get; set; }
        public string ClientSecret2 { get; set; }
        public string deviceSerialNumber { get; set; }
    }
}
