namespace LMS_CMS_BL.DTO.Accounting
{
    public class AccountingConfigurationsEditDTO
    {
        public int ID { get; set; }
        public long? SalesID { get; set; }
        public long? SalesReturnID { get; set; }
        public long? PurchaseID { get; set; }
        public long? PurchaseReturnID { get; set; }
    }
}
