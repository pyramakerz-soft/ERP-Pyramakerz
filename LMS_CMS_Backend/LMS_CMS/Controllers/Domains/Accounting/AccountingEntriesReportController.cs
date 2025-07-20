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
            if (toDate < fromDate)
                return BadRequest("Start date must be equal or greater than End date");

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            int startRow = ((pageNumber - 1) * pageSize) + 1;
            int endRow = pageNumber * pageSize;

            //var result = await context.Set<AccountingEntriesReport>().FromSqlRaw(@"
            //    WITH EntriesWithRowNum AS (
            //        SELECT *, ROW_NUMBER() OVER (ORDER BY MasterID) AS RowNum
            //        FROM dbo.EntriesFun(@DateFrom, @DateTo)
            //    )
            //    SELECT *
            //    FROM EntriesWithRowNum
            //    WHERE RowNum BETWEEN @StartRow AND @EndRow
            //    ORDER BY RowNum;
            //",
            //new SqlParameter("@DateFrom", fromDate),
            //new SqlParameter("@DateTo", toDate),
            //new SqlParameter("@StartRow", startRow),
            //new SqlParameter("@EndRow", endRow)
            //).ToListAsync();

            var result = await context.Set<AccountingEntriesReport>().FromSqlRaw(
                "EXEC dbo.GetAccountingEntries @DateFrom, @DateTo, @MainAccNo, @SubAccNo, @StartRow, @EndRow",
                new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                new SqlParameter("@MainAccNo", AccountNumber),
                new SqlParameter("@SubAccNo", SubAccountNumber),
                new SqlParameter("@StartRow", startRow),
                new SqlParameter("@EndRow", endRow)
            ).ToListAsync();


            if (result == null || !result.Any())
            {
                return NotFound("No accounting entries found for the specified date range.");
            }

            var fullTotals = (await context.Set<TotalResult>()
            .FromSqlRaw("EXEC dbo.GetAccountingTotals @DateFrom, @DateTo",
                new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value))
            .ToListAsync())
            .FirstOrDefault();


            decimal fullDebit = fullTotals?.TotalDebit ?? 0;
            decimal fullCredit = fullTotals?.TotalCredit ?? 0;
            decimal fullDifference = fullTotals?.Differences ?? 0;

            var groupedResult = result
                .Where(e => e.Date != null)
                .GroupBy(e => e.Date.Value.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Entries = g.ToList(),
                    Totals = new
                    {
                        Debit = g.Sum(x => x.Debit ?? 0),
                        Credit = g.Sum(x => x.Credit ?? 0),
                        Difference = g.Sum(x => x.Debit ?? 0) - g.Sum(x => x.Credit ?? 0)
                    }
                })
                .OrderBy(g => g.Date)
                .ToList();

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

            return Ok(new
            {
                Data = groupedResult,
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
