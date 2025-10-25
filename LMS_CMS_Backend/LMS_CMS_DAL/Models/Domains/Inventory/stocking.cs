using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.Zatca;

namespace LMS_CMS_DAL.Models.Domains.Inventory
{
    public class Stocking : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public string Date { get; set; }
        public long? AdditionId { get; set; }
        public long? DisbursementId { get; set; }

        [ForeignKey("Store")]
        public long StoreID { get; set; }
        public Store Store { get; set; }

        [ForeignKey("School")]
        public long? SchoolId { get; set; }
        public School School { get; set; }


        [ForeignKey("SchoolPCs")]
        public long? SchoolPCId { get; set; }
        public SchoolPCs SchoolPCs { get; set; }

        public ICollection<StockingDetails> StockingDetails { get; set; } = new HashSet<StockingDetails>();
    }
}
