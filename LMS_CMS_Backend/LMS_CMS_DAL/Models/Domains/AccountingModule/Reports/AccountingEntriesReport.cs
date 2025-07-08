namespace LMS_CMS_DAL.AccountingModule.Reports
{
    public class AccountingEntriesReport
    {
        public string Account { get; set; }
        public string InvoiceNumber { get; set; }
        public long MainAccountNo { get; set; }
        public string MainAccount { get; set; }
        public long SubAccountNo { get; set; }
        public string SubAccount { get; set; }
        public decimal? Debit { get; set; }
        public decimal? Credit { get; set; }
    }
}
