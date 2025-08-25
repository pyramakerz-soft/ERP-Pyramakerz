using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.AccountingModule.Reports;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Accounting
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    public class AccountStatementReports : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public AccountStatementReports(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }

        #region Account Statement
        [HttpGet("GetAccountStatement")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Account Statement" }
        )]
        public async Task<IActionResult> GetAccountStatement(long linkFileID, DateTime? fromDate, DateTime? toDate, long SubAccountNumber, int pageNumber = 1, int pageSize = 10)
        {
            if (fromDate.HasValue && toDate.HasValue && toDate < fromDate)
                return BadRequest("Start date must be equal or greater than End date");

            if (SubAccountNumber <= 0)
                return BadRequest("sub-account number can not be 0.");

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            long? accountNumberId = linkFileID switch
            {
                2 => Unit_Of_Work.supplier_Repository.First_Or_Default(s => s.ID == SubAccountNumber)?.AccountNumberID,
                3 => Unit_Of_Work.debit_Repository.First_Or_Default(d => d.ID == SubAccountNumber)?.AccountNumberID,
                4 => Unit_Of_Work.credit_Repository.First_Or_Default(c => c.ID == SubAccountNumber)?.AccountNumberID,
                5 => Unit_Of_Work.save_Repository.First_Or_Default(s => s.ID == SubAccountNumber)?.AccountNumberID,
                6 => Unit_Of_Work.bank_Repository.First_Or_Default(b => b.ID == SubAccountNumber)?.AccountNumberID,
                7 => Unit_Of_Work.income_Repository.First_Or_Default(s => s.ID == SubAccountNumber)?.AccountNumberID,
                8 => Unit_Of_Work.outcome_Repository.First_Or_Default(s => s.ID == SubAccountNumber)?.AccountNumberID,
                9 => Unit_Of_Work.asset_Repository.First_Or_Default(s => s.ID == SubAccountNumber)?.AccountNumberID,
                10 => Unit_Of_Work.employee_Repository.First_Or_Default(s => s.ID == SubAccountNumber)?.AccountNumberID,
                11 => Unit_Of_Work.tuitionFeesType_Repository.First_Or_Default(s => s.ID == SubAccountNumber)?.AccountNumberID,
                12 => Unit_Of_Work.tuitionDiscountType_Repository.First_Or_Default(s => s.ID == SubAccountNumber)?.AccountNumberID,
                13 => Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == SubAccountNumber)?.AccountNumberID,
                _ => null
            };

            if (accountNumberId == null)
                return NotFound("Sub account number not found.");

            var accountingTree = Unit_Of_Work.accountingTreeChart_Repository
                .First_Or_Default(a => a.ID == accountNumberId && a.IsDeleted != true);

            if (accountingTree == null)
                return NotFound("Main account number not found.");

            var results = await context.Set<AccountStatementReport>().FromSqlRaw(
                "EXEC dbo.GetAccountStatement @DateFrom, @DateTo, @LinkFileID, @SubAccNo",
                new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                new SqlParameter("@LinkFileID", linkFileID),
                new SqlParameter("@SubAccNo", SubAccountNumber)
            )
                .AsNoTracking()
                .ToListAsync();

            if (results == null || !results.Any())
                return NotFound("No account statements found.");

            decimal? runningBalance = 0;
            List<AccountStatementReport> calcFirstPeriod;
            TotalResult fullTotals = new();
            decimal? firstPeriodBalance = 0;

            var dateToValue = fromDate.Value.AddDays(-1);

            calcFirstPeriod = await context.Set<AccountStatementReport>().FromSqlRaw(
                "EXEC dbo.GetAccountStatement @DateFrom, @DateTo, @LinkFileID, @SubAccNo",
                new SqlParameter("@DateFrom", "1900-1-1" ?? (object)DBNull.Value),
                new SqlParameter("@DateTo", (object)dateToValue ?? DBNull.Value),
                new SqlParameter("@LinkFileID", linkFileID),
                new SqlParameter("@SubAccNo", SubAccountNumber)
            )
                .AsNoTracking()
                .ToListAsync();

            bool isCredit = linkFileID switch
            {
                2 or 4 or 7 or 10 or 11 => true,
                _ => false
            };

            fullTotals.TotalDebit = calcFirstPeriod.Sum(x => x.Debit ?? 0);
            fullTotals.TotalCredit = calcFirstPeriod.Sum(x => x.Credit ?? 0);

            firstPeriodBalance = isCredit ? fullTotals.TotalCredit - fullTotals.TotalDebit : fullTotals.TotalDebit - fullTotals.TotalCredit;

            results.Insert(0, new AccountStatementReport
            {
                Account = "Opening Balance",
                Serial = 0,
                SubAccountNo = 0,
                SubAccount = "",
                Debit = 0,
                Credit = 0,
                Date = dateToValue,
                Balance = firstPeriodBalance,
                Notes = ""
            });

            decimal? balance = 0;

            for (int i = 1; i < results.Count; i++)
            {
                var item = results[i];

                balance = isCredit ? item.Credit - item.Debit : item.Debit - item.Credit;

                if (i == 1)
                    runningBalance += balance + results[0].Balance;
                else
                    runningBalance += balance;

                item.Balance = runningBalance;
            }

            fullTotals.TotalDebit += results.Sum(x => x.Debit ?? 0);
            fullTotals.TotalCredit += results.Sum(x => x.Credit ?? 0);

            fullTotals.Differences = isCredit ? fullTotals.TotalCredit - fullTotals.TotalDebit :
                 fullTotals.TotalDebit - fullTotals.TotalCredit;

            long totalRecords = results?.Count() ?? 0;

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new
            {
                Data = results,
                FirstPeriodBalance = firstPeriodBalance,
                FullTotals = new
                {
                    totalDebit = fullTotals.TotalDebit,
                    totalCredit = fullTotals.TotalCredit,
                    difference = fullTotals.Differences
                },
                Pagination = paginationMetadata
            });
        }
        #endregion
    }
}
