namespace LMS_CMS_DAL.Models.Domains.AccountingModule.Reports
{
    public class AccountBalanceReport
    {
        public long? ID { get; set; }
        public string? Name { get; set; }
        public decimal? Debit { get; set; }
        public decimal? Credit { get; set; }
    }
}
