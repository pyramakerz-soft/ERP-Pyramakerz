using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.AccountingModule.Reports;
using LMS_CMS_DAL.Models.Domains.AccountingModule.Reports;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;

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
        public async Task<IActionResult> GetAccountingEntriesAsync(DateTime? fromDate, DateTime? toDate, int pageNumber = 1, int pageSize = 10)
        {
            if (fromDate.HasValue && toDate.HasValue && toDate < fromDate)
                return BadRequest("Start date must be equal or greater than End date");

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            int startRow = ((pageNumber - 1) * pageSize) + 1;
            int endRow = pageNumber * pageSize;

            var results = await context.Set<AccountingEntriesReport>().FromSqlRaw(
                "EXEC dbo.GetAccountingEntries @DateFrom, @DateTo, 0, 0, 0, @StartRow, @EndRow",
                new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                new SqlParameter("@StartRow", startRow),
                new SqlParameter("@EndRow", endRow)
            ).ToListAsync();

            if (results == null || !results.Any())
            {
                return NotFound("No accounting entries found for the specified date range.");
            }

            dynamic grouped;
            decimal? runningBalance = 0;
            TotalResult calcFirstPeriod = null;
            TotalResult fullTotals = null;
            decimal? firstPeriodBalance = 0;

            decimal? fullDebit = 0;
            decimal? fullCredit = 0;
            decimal? fullDifference = 0;

            grouped = results
            .GroupBy(x => x.Date.Value.Date)
            .Select((g, index) =>
            {
                var entries = g.ToList();

                var totalDebit = entries.Sum(x => x.Debit ?? 0);
                var totalCredit = entries.Sum(x => x.Credit ?? 0);

                bool isCreditBased = entries.Any(x => x.LinkFileID == 2 || x.LinkFileID == 4 || x.LinkFileID == 7);

                var difference = isCreditBased
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
                .FromSqlInterpolated($@"EXEC dbo.GetAccountingTotals 
                    {fromDate ?? (object)DBNull.Value}, 
                    {toDate ?? (object)DBNull.Value}, 
                    {0}, 
                    {0}, 
                    {0}")
                .AsNoTracking()
                .ToListAsync())
                .FirstOrDefault();

            fullDebit = fullTotals?.TotalDebit ?? 0;
            fullCredit = fullTotals?.TotalCredit ?? 0;
            fullDifference = fullTotals?.Differences ?? 0;

            int totalRecords = (await context.Set<CountResult>()
                .FromSqlInterpolated($@"
                    SELECT dbo.GetEntriesCount({fromDate}, {toDate}, 0, 0, 0) AS TotalCount")
                .ToListAsync())
                .FirstOrDefault()?.TotalCount ?? 0;

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new
            {
                Data = grouped,
                FullTotals = new
                {
                    Debit = fullDebit,
                    Credit = fullCredit,
                    Difference = fullDifference
                },
                Pagination = paginationMetadata
            });
            
        }
        #endregion
    }
}