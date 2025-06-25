
namespace LMS_CMS_BL.DTO.ETA
{
    public class TaxIssuerEditDTO
    {
        public string ID { get; set; }
        public int? TaxType { get; set; }
        public string Name { get; set; }
        public string ActivityCode { get; set; }
        public string BranchID { get; set; }
        public string CountryCode { get; set; }
        public string Governate { get; set; }
        public string RegionCity { get; set; }
        public string Street { get; set; }
        public string BuildingNumber { get; set; }
        public string? PostalCode { get; set; }
        public string? Floor { get; set; }
        public string? Room { get; set; }
        public string? LandMark { get; set; }
        public string? AdditionalInfo { get; set; }
    }
}
