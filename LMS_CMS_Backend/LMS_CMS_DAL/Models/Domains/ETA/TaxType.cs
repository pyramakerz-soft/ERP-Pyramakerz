
using System.ComponentModel.DataAnnotations;

namespace LMS_CMS_DAL.Models.Domains.ETA
{
    public class TaxType
    {
        [Key]
        public int ID { get; set; }
        public string Type { get; set; }
    }
}
