using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LMS_CMS_DAL.Models.Domains.AccountingModule
{
    public class AccountingConfigurations : AuditableEntity
    {
        [Key]
        public int ID { get; set; }

        [ForeignKey("Sales")]
        public long? SalesID { get; set; }

        [ForeignKey("SalesReturn")]
        public long? SalesReturnID { get; set; }

        [ForeignKey("Purchase")]
        public long? PurchaseID { get; set; }

        [ForeignKey("PurchaseReturn")]
        public long? PurchaseReturnID { get; set; }

        public AccountingTreeChart? Sales { get; set; }
        public AccountingTreeChart? SalesReturn { get; set; }
        public AccountingTreeChart? Purchase { get; set; }
        public AccountingTreeChart? PurchaseReturn { get; set; }
    }
}
