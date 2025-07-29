using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.AccountingModule.Reports;
using LMS_CMS_DAL.Models.Domains.AccountingModule.Reports;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Accounting
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class AccountingEntriesReportController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public AccountingEntriesReportController(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }

        #region Accounting Entries
        [HttpGet("AccountingEntries")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Accounting Constraints Report" }
        )]
        public async Task<IActionResult> GetAccountingEntriesAsync(DateTime? fromDate, DateTime? toDate, long? AccountNumber = 0, long? SubAccountNumber = 0, int pageNumber = 1, int pageSize = 10)
        {
            if (fromDate.HasValue && toDate.HasValue && toDate < fromDate)
                return BadRequest("Start date must be equal or greater than End date");

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            int startRow = ((pageNumber - 1) * pageSize) + 1;
            int endRow = pageNumber * pageSize;

            var results = await context.Set<AccountingEntriesReport>().FromSqlRaw(
                "EXEC dbo.GetAccountingEntries @DateFrom, @DateTo, @MainAccNo, @SubAccNo, @StartRow, @EndRow",
                new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                new SqlParameter("@MainAccNo", AccountNumber),
                new SqlParameter("@SubAccNo", SubAccountNumber),
                new SqlParameter("@StartRow", startRow),
                new SqlParameter("@EndRow", endRow)
            ).ToListAsync();

            if (results == null || !results.Any())
            {
                return NotFound("No accounting entries found for the specified date range.");
            }

            dynamic grouped;
            long? linkFileID = results.FirstOrDefault()?.LinkFileID;
            var isCreditBalance = linkFileID == 2 || linkFileID == 4 || linkFileID == 7;
            decimal? runningBalance = 0;
            TotalResult calcFirstPeriod = null;
            TotalResult fullTotals = null;
            decimal? firstPeriodBalance = 0;

            decimal? fullDebit = 0;
            decimal? fullCredit = 0;
            decimal? fullDifference = 0;

            int totalRecords = (await context.Set<CountResult>()
                .FromSqlInterpolated($@"
                    SELECT dbo.GetEntriesCount({fromDate}, {toDate}) AS TotalCount")
                .ToListAsync())
                .FirstOrDefault()?.TotalCount ?? 0;

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            if (AccountNumber > 0 || SubAccountNumber > 0)
            {
                var dateToValue = fromDate.Value.AddDays(-1);

                calcFirstPeriod = (await context.Set<TotalResult>()
                .FromSqlRaw(
                    "EXEC dbo.GetAccountingTotals @DateFrom, @DateTo, @MainAccNo, @SubAccNo, @LinkFileID",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", (object)dateToValue ?? DBNull.Value),
                    new SqlParameter("@MainAccNo", AccountNumber),
                    new SqlParameter("@SubAccNo", SubAccountNumber),
                    new SqlParameter("@LinkFileID", linkFileID ?? (object)DBNull.Value)
                )
                .AsNoTracking()
                .ToListAsync())
                .FirstOrDefault();

                results.Insert(0, new AccountingEntriesReport
                {
                    MasterID = 0,
                    DetailsID = 0,
                    Account = "Opening Balance",
                    Serial = 0,
                    MainAccountNo = 0,
                    MainAccount = "",
                    SubAccountNo = 0,
                    SubAccount = "",
                    Debit = calcFirstPeriod?.TotalDebit ?? 0,
                    Credit = calcFirstPeriod?.TotalCredit ?? 0,
                    Date = dateToValue, 
                    Balance = calcFirstPeriod?.Differences ?? 0,
                    LinkFileID = 0,
                    Notes = ""
                });

                for (int i = 0; i < results.Count; i++)
                {
                    var item = results[i];

                    decimal? balance = isCreditBalance
                        ? item.Credit - item.Debit
                        : item.Debit - item.Credit;

                    runningBalance += balance;
                    item.Balance = runningBalance;
                }

                fullTotals = (await context.Set<TotalResult>()
                .FromSqlRaw(
                    "EXEC dbo.GetAccountingTotals @DateFrom, @DateTo, @MainAccNo, @SubAccNo, @LinkFileID",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@MainAccNo", AccountNumber),
                    new SqlParameter("@SubAccNo", SubAccountNumber),
                    new SqlParameter("@LinkFileID", linkFileID ?? (object)DBNull.Value)
                )
                .AsNoTracking()
                .ToListAsync())
                .FirstOrDefault();

                fullDebit = fullTotals?.TotalDebit ?? 0;
                fullCredit = fullTotals?.TotalCredit ?? 0;
                fullDifference = fullTotals?.Differences ?? 0;

                return Ok(new
                {
                    Data = results,
                    FirstPeriodBalance = firstPeriodBalance,
                    FullTotals = new
                    {
                        Debit = fullDebit,
                        Credit = fullCredit,
                        Difference = fullDifference
                    },
                    Pagination = paginationMetadata
                });
            }
            else
            {
                grouped = results
                .GroupBy(x => x.Date.Value.Date)
                .Select((g, index) =>
                {
                    var entries = g.ToList();

                    var totalDebit = entries.Sum(x => x.Debit ?? 0);
                    var totalCredit = entries.Sum(x => x.Credit ?? 0);
                    var difference = isCreditBalance
                        ? totalCredit - totalDebit
                        : totalDebit - totalCredit;

                    return new
                    {
                        Date = g.Key,
                        Entries = entries,
                        Totals = new
                        {
                            Debit = totalDebit,
                            Credit = totalCredit,
                            Difference = difference
                        }
                    };
                }); 
                
                fullTotals = (await context.Set<TotalResult>()
                .FromSqlRaw(
                    "EXEC dbo.GetAccountingTotals @DateFrom, @DateTo, @MainAccNo, @SubAccNo, @LinkFileID",
                    new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@MainAccNo", AccountNumber),
                    new SqlParameter("@SubAccNo", SubAccountNumber),
                    new SqlParameter("@LinkFileID", linkFileID ?? (object)DBNull.Value)
                )
                .AsNoTracking()
                .ToListAsync())
                .FirstOrDefault();

                fullDebit = fullTotals?.TotalDebit ?? 0;
                fullCredit = fullTotals?.TotalCredit ?? 0;
                fullDifference = fullTotals?.Differences ?? 0;

                return Ok(new
                {
                    Data = grouped,
                    FirstPeriodBalance = firstPeriodBalance,
                    FullTotals = new
                    {
                        Debit = fullDebit,
                        Credit = fullCredit,
                        Difference = fullDifference
                    },
                    Pagination = paginationMetadata
                });
            }
        }
        #endregion
    }
}
