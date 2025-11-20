using LMS_CMS_BL.UOW;
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
        public async Task<IActionResult> GetAccountingEntriesAsync(DateTime? fromDate, DateTime? toDate, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                if (fromDate.HasValue && toDate.HasValue && toDate < fromDate)
                    return BadRequest("Start date must be equal or greater than End date");

                UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
                var context = Unit_Of_Work.DbContext;

                // FIX 1: Increase Timeout for Reports
                // Reports on large tables often take > 30s. Set to 3 minutes (180s) or more.
                context.Database.SetCommandTimeout(180);

                // 1. Get Data
                var results = await context.Set<AccountingEntriesReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountingEntries @DateFrom, @DateTo, @PageNumber, @PageSize",
                    new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@PageNumber", pageNumber),
                    new SqlParameter("@PageSize", pageSize)
                )
                .AsNoTracking()
                .ToListAsync();

                // Handle empty result early to save processing time on Totals/Counts if main data is empty
                // (Unless your totals need to show even if the specific page is empty, 
                // but usually if the filter yields nothing, totals are 0).
                if (results == null || !results.Any())
                {
                    // Check if it's just a pagination issue (page 5 empty, but total records > 0)
                    // We run count to verify.
                    var checkCount = await context.Database
                       .SqlQueryRaw<long>("SELECT dbo.GetEntriesCount(@DateFrom, @DateTo, 0, 0) AS Value",
                           new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                           new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value))
                       .FirstAsync();

                    if (checkCount == 0)
                    {
                        return Ok(new { Data = new List<object>(), FullTotals = new List<object>(), Pagination = new { TotalRecords = 0, PageSize = pageSize, CurrentPage = pageNumber, TotalPages = 0 } });
                    }
                    // If count > 0 but results empty, it means pageNumber is out of range, 
                    // usually frontend handles this via the pagination metadata returned below.
                }

                // 2. Get Full Totals (Likely the most expensive query)
                var fullTotals = await context.Set<TotalResult>().FromSqlRaw(
                    "EXEC dbo.GetAccountingTotals @DateFrom, @DateTo",
                    new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value)
                )
                .ToListAsync();

                var totalRecords = await context.Database
                    .SqlQueryRaw<long>("SELECT dbo.GetDistinctDateCount(@DateFrom, @DateTo) AS Value",
                        new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                        new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value))
                    .FirstAsync();


                // 4. Process Results in Memory (This is fast)
                var groupedResults = results
                .GroupBy(x => x.Date.Value.Date)
                .Select((g, index) =>
                {
                    var entries = g.ToList();
                    var totalDebit = entries.Sum(x => x.Debit ?? 0);
                    var totalCredit = entries.Sum(x => x.Credit ?? 0);
                    var difference = totalCredit > totalDebit
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
                })
                .OrderBy(g => g.Date)
                .ToList();

                var paginationMetadata = new
                {
                    TotalRecords = totalRecords,
                    PageSize = pageSize,
                    CurrentPage = pageNumber,
                    TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
                };

                return Ok(new
                {
                    Data = groupedResults,
                    FullTotals = fullTotals.FirstOrDefault(), // Usually Totals return 1 row, cleaner to unwrap
                    Pagination = paginationMetadata
                });
            }
            catch (Exception ex)
            {
                // Log the error to your console/file/logger to see the REAL issue
                Console.WriteLine($"Report Error: {ex.Message}");
                // Return 500 but with the message in Dev environment, or generic in Prod
                return StatusCode(500, new { error = "Internal Server Error", details = ex.Message });
            }
        }
        #endregion
    }
}