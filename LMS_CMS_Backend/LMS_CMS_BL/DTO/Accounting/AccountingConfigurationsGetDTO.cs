namespace LMS_CMS_BL.DTO.Accounting
{
    public class AccountingConfigurationsGetDTO
    {
        public int ID { get; set; }
        public string? Sales { get; set; }
        public string? SalesReturn { get; set; }
        public string? Purchase { get; set; }
        public string? PurchaseReturn { get; set; }
        public long? SalesID { get; set; }
        public long? SalesReturnID { get; set; }
        public long? PurchaseID { get; set; }
        public long? PurchaseReturnID { get; set; }
    }
}
