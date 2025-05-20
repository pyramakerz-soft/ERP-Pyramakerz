
using System.ComponentModel.DataAnnotations;

namespace LMS_CMS_DAL.Models.Domains.ETA
{
    public class TaxCustomer
    {
        [Key]
        public int ID { get; set; }
        public string Type { get; set; }
        public string? EnDescription { get; set; }
        public string? ArDescription { get; set; }
    }
}
