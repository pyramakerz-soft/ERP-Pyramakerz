
namespace LMS_CMS_DAL.Models.Domains.AccountingModule.Reports
{
    public class AccountStatementReport
    {
        public DateTime? Date { get; set; }
        public string? Account { get; set; }
        public long? Serial { get; set; }
        public string? SubAccount { get; set; }
        public decimal? Credit { get; set; }
        public decimal? Debit { get; set; }
        public decimal? Balance { get; set; }
        public string? Notes { get; set; }
    }
}
