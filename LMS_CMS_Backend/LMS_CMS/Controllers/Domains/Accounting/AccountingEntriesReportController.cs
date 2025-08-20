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
        public async Task<IActionResult> GetAccountingEntriesAsync(DateTime? fromDate, DateTime? toDate, int pageNumber = 1, int pageSize = 10)
        {
            if (fromDate.HasValue && toDate.HasValue && toDate < fromDate)
                return BadRequest("Start date must be equal or greater than End date");

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            var results = await context.Set<AccountingEntriesReport>().FromSqlRaw(
                "EXEC dbo.GetAccountingEntries @DateFrom, @DateTo",
                new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value)
            )
                .AsNoTracking()
                .ToListAsync();

            if (results == null || !results.Any())
            {
                return NotFound("No accounting entries found for the specified date range.");
            }

            TotalResult fullTotals = new();

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
            }).OrderBy(g => g.Date);

            var pagedGroups = groupedResults
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            decimal? fullDebit = results?.Sum(x => x.Debit) ?? 0;
            decimal? fullCredit = results?.Sum(x => x.Credit) ?? 0;
            decimal? fullDifference = fullCredit > fullDebit ? fullCredit - fullDebit : fullDebit - fullCredit;

            long totalRecords = groupedResults.Count();

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new
            {
                Data = pagedGroups,
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