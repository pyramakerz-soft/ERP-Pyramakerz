using System.ComponentModel.DataAnnotations;

namespace LMS_CMS_DAL.Models.Domains.ETA
{
    public class TaxReceiver : AuditableEntity
    {
        [Key]
        public string? ID { get; set; }
        public string? Type { get; set; }
        public string? Name { get; set; }
        public string? ActivityCode { get; set; }
        public string? Country { get; set; }
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
