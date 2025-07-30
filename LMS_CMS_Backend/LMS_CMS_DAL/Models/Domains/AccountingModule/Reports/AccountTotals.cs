namespace LMS_CMS_DAL.Models.Domains.AccountingModule.Reports
{
    public class AccountTotals
    {
        public decimal? TotalDebit { get; set; } = 0;
        public decimal? TotalCredit { get; set; } = 0;
        public decimal? Differences { get; set; } = 0;
    }
}
