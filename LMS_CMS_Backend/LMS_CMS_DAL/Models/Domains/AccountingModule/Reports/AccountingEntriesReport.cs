namespace LMS_CMS_DAL.Models.Domains.AccountingModule.Reports
{
    public class AccountingEntriesReport
    {
        //public long? MasterID { get; set; }
        //public long? DetailsID { get; set; }
        public string? Account { get; set; }
        public long? Serial { get; set; }
        public long? MainAccountNo { get; set; }
        public string? MainAccount { get; set; }
        public long? SubAccountNo { get; set; }
        public string? SubAccount { get; set; }
        public string? InvoiceNumber { get; set; }
        public decimal? Debit { get; set; }
        public decimal? Credit { get; set; }
        public DateTime? Date { get; set; }
        //public decimal? Balance { get; set; }
        //public long? LinkFileID { get; set; }
        public string? Notes { get; set; }
    }
}
