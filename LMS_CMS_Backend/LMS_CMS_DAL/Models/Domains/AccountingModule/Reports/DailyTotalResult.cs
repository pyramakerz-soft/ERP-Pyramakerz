namespace LMS_CMS_DAL.Models.Domains.AccountingModule.Reports
{
    public class DailyTotalResult
    {
        public DateTime Date { get; set; }
        public decimal? TotalDebit { get; set; }
        public decimal? TotalCredit { get; set; }
        public decimal? Difference { get; set; }
    }
}
