using LMS_CMS_DAL.Models.Octa;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LMS_CMS_DAL.Models.Domains.ETA
{
    public class TaxReceiver : AuditableEntity
    {
        [Key]
        public string? ID { get; set; }

        [ForeignKey("TaxReceiverType")]
        public int? TypeID { get; set; }
        public TaxType? TaxReceiverType { get; set; }

        public string? Name { get; set; }
        public string? ActivityCode { get; set; }

        [ForeignKey("Country")]
        public long? CountryID { get; set; }
        public Country? Country { get; set; }

        public string? Governate { get; set; }
        public string? RegionCity { get; set; }
        public string? Street { get; set; }
        public string? BuildingNumber { get; set; }
        public string? PostalCode { get; set; }
        public string? Floor { get; set; }
        public string? Room { get; set; }
        public string? LandMark { get; set; }
        public string? AdditionalInfo { get; set; }
    }
}
