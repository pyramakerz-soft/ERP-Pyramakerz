using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.AccountingModule.Reports;
using LMS_CMS_DAL.Models.Domains.AccountingModule.Reports;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Accounting
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    //[Authorize]
    public class AccountingEntriesReportController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public AccountingEntriesReportController(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }

        #region Accounting Entries
        [HttpGet("AccountingEntries")]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "" }
        //)]
        public async Task<IActionResult> GetAccountingEntriesAsync(DateTime fromDate, DateTime toDate, long AccountNumber, long SubAccountNumber, int pageNumber = 1, int pageSize = 10)
        {
            if (toDate < fromDate)
                return BadRequest("Start date must be equal or greater than End date");

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            int startRow = ((pageNumber - 1) * pageSize) + 1;
            int endRow = pageNumber * pageSize;

            var result = await context.Set<AccountingEntriesReport>().FromSqlRaw(@"
                WITH EntriesWithRowNum AS (
                    SELECT *, ROW_NUMBER() OVER (ORDER BY MasterID) AS RowNum
                    FROM dbo.EntriesFun(@DateFrom, @DateTo)
                )
                SELECT *
                FROM EntriesWithRowNum
                WHERE RowNum BETWEEN @StartRow AND @EndRow
                ORDER BY RowNum;
            ",
            new SqlParameter("@DateFrom", fromDate),
            new SqlParameter("@DateTo", toDate),
            new SqlParameter("@StartRow", startRow),
            new SqlParameter("@EndRow", endRow)
            ).ToListAsync();

            if (result == null || !result.Any())
            {
                return NotFound("No accounting entries found for the specified date range.");
            }

            var fullTotals = await context.Set<TotalResult>()
                .FromSqlRaw(@"
                    SELECT 
                        SUM(Debit) AS TotalDebit,
                        SUM(Credit) AS TotalCredit
                    FROM dbo.EntriesFun(@DateFrom, @DateTo)",
                    new SqlParameter("@DateFrom", fromDate),
                    new SqlParameter("@DateTo", toDate)
                ).FirstOrDefaultAsync();

            decimal fullDebit = fullTotals?.TotalDebit ?? 0;
            decimal fullCredit = fullTotals?.TotalCredit ?? 0;
            decimal fullDifference = fullDebit - fullCredit;

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

            int totalRecords = await context.Set<CountResult>()
                .FromSqlRaw(@"
                    SELECT COUNT(MasterID) AS TotalCount 
                    FROM dbo.EntriesFun(@DateFrom, @DateTo)",
                    new SqlParameter("@DateFrom", DBNull.Value),
                    new SqlParameter("@DateTo", DBNull.Value))
                .Select(x => x.TotalCount)
                .FirstOrDefaultAsync();

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
                Pagination = paginationMetadata,
                FullTotals = new
                {
                    Debit = fullDebit,
                    Credit = fullCredit,
                    Difference = fullDifference
                }
            });
        }
        #endregion
    }
}
