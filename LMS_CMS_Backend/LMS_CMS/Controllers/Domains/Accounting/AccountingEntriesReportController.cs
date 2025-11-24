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

                context.Database.SetCommandTimeout(180);

                var results = await context.Set<AccountingEntriesReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountingEntries @DateFrom, @DateTo, @PageNumber, @PageSize",
                    new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@PageNumber", pageNumber),
                    new SqlParameter("@PageSize", pageSize)
                )
                .AsNoTracking()
                .ToListAsync();

                if (results == null || !results.Any())
                {
                    var checkCount = await context.Database
                       .SqlQueryRaw<long>("SELECT dbo.GetEntriesCount(@DateFrom, @DateTo, 0, 0) AS Value",
                           new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                           new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value))
                       .FirstAsync();

                    if (checkCount == 0)
                    {
                        return Ok(new { Data = new List<object>(), FullTotals = new List<object>(), Pagination = new { TotalRecords = 0, PageSize = pageSize, CurrentPage = pageNumber, TotalPages = 0 } });
                    }
                }

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
                    FullTotals = fullTotals.FirstOrDefault(), 
                    Pagination = paginationMetadata
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal Server Error", details = ex.Message });
            }
        }
        #endregion
    }
}