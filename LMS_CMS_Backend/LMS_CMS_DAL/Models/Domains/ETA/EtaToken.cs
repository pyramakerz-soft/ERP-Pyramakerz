using System.ComponentModel.DataAnnotations.Schema;

namespace LMS_CMS_DAL.Models.Domains.ETA
{
    public class EtaToken
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public string PIN { get; set; }

        [ForeignKey("EtaTokenType")]
        public int EtaTokenTypeID { get; set; }
        public EtaTokenType? EtaTokenType { get; set; }
    }
}
