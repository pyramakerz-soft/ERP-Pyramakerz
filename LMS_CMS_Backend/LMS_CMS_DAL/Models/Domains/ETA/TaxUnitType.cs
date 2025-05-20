using System.ComponentModel.DataAnnotations;

namespace LMS_CMS_DAL.Models.Domains.ETA
{
    public class TaxUnitType
    {
        [Key]
        public int ID { get; set; }
        public string code { get; set; }
        public string? desc_en { get; set; }
        public string? desc_ar { get; set; }
    }
}
