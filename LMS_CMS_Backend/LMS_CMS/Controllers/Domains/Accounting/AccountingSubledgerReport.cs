using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
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
    public class AccountingSubledgerReport : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public AccountingSubledgerReport(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }

        #region Accounts Subledger
        [HttpGet("GetAccountsLedger")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Account Subledger Report" }
        )]
        public async Task<IActionResult> GetAccountsLedger(DateTime? fromDate, DateTime? toDate, long linkFileID, long? accountID = 0, int pageNumber = 1, int pageSize = 10)
        {
            if (fromDate.HasValue && toDate.HasValue && toDate < fromDate)
                return BadRequest("Start date must be equal or greater than End date");

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            long totalRecords = 0;

            var dateToValue = fromDate.Value.AddDays(-1);
            TotalResult calcFirstPeriod;

            bool isCredit = linkFileID switch
            {
                2 or 4 or 7 or 10 or 11 => true,
                _ => false
            };

            if (accountID == 0)
            {
                var results = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountLedger @DateFrom, @DateTo, 0, @LinkFileID, @PageNumber, @PageSize",
                    new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@LinkFileID", linkFileID),
                    new SqlParameter("@PageNumber", pageNumber),
                    new SqlParameter("@PageSize", pageSize)
                )
                    .AsNoTracking()
                    .ToListAsync();

                if (results == null || !results.Any())
                    return NotFound("No data found.");

                var resultsCredits = results.Sum(x => x.Credit);
                var resultsDebits = results.Sum(x => x.Debit);

                var resultsTotals = new
                {
                    TotalCredit = resultsCredits,
                    TotalDebit = resultsDebits,
                    Difference = isCredit ? resultsCredits - resultsDebits : resultsDebits - resultsCredits
                };

                var firstPeriodBalance = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountLedger @DateFrom, @DateTo, 0, @LinkFileID, @PageNumber, @PageSize",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", (object)dateToValue ?? DBNull.Value),
                    new SqlParameter("@LinkFileID", linkFileID),
                    new SqlParameter("@PageNumber", pageNumber),
                    new SqlParameter("@PageSize", pageSize)
                )
                    .AsNoTracking()
                    .ToListAsync();

                var fpCredits = isCredit ? firstPeriodBalance.Sum(x => x.Credit) : 0;
                var fpDebits = !isCredit ? firstPeriodBalance.Sum(x => x.Debit) : 0;

                var firstPeriodTotals = new
                {
                    TotalCredit = isCredit ? fpCredits - fpDebits : 0,
                    TotalDebit = !isCredit ? fpDebits - fpCredits : 0,
                    Difference = isCredit ? fpCredits - fpDebits : fpDebits - fpCredits
                };

                List<AccountBalanceReport>? lastPeriodBalance = new();

                for (int i = 0; i < results.Count; i++)
                {
                    lastPeriodBalance.Add(new AccountBalanceReport()
                    {
                        ID = results[i].ID,
                        Name = results[i].Name,
                        Credit = isCredit ? 
                            (firstPeriodBalance?.Count() > 0 ? 
                            firstPeriodBalance[i].Credit - results[i].Debit : 
                            0 - results[i].Debit) + results[i].Credit : 0,
                        Debit = !isCredit ?
                            (firstPeriodBalance?.Count() > 0 ?
                            firstPeriodBalance[i].Debit - results[i].Credit :
                            0 - results[i].Credit) + results[i].Debit : 0
                    });
                }

                var lastPeriodTotals = new
                {
                    TotalCredit = isCredit ? fpCredits + resultsCredits - resultsDebits : 0,
                    TotalDebit = !isCredit ? fpDebits + resultsDebits - resultsCredits : 0,
                    Difference = isCredit ? fpCredits - fpDebits :  fpDebits - fpCredits
                };

                totalRecords = linkFileID switch
                {
                    2 => (await context.Suppliers.Where(s => s.IsDeleted != true).ToListAsync()).Count(),
                    3 => (await context.Debits.Select(d => d.IsDeleted != true).ToListAsync()).Count(),
                    4 => (await context.Credits.Select(c => c.IsDeleted != true).ToListAsync()).Count(),
                    5 => (await context.Saves.Select(s => s.IsDeleted != true).ToListAsync()).Count(),
                    6 => (await context.Banks.Select(b => b.IsDeleted != true).ToListAsync()).Count(),
                    7 => (await context.Incomes.Select(i => i.IsDeleted != true).ToListAsync()).Count(),
                    8 => (await context.Outcomes.Select(o => o.IsDeleted != true).ToListAsync()).Count(),
                    9 => (await context.Assets.Select(a => a.IsDeleted != true).ToListAsync()).Count(),
                    10 => (await context.Employee.Select(e => e.IsDeleted != true).ToListAsync()).Count(),
                    11 => (await context.TuitionFeesTypes.Select(t => t.IsDeleted != true).ToListAsync()).Count(),
                    12 => (await context.TuitionDiscountTypes.Select(t => t.IsDeleted != true).ToListAsync()).Count(),
                    13 => (await context.Student.Select(s => s.IsDeleted != true).ToListAsync()).Count(),
                    _ => throw new InvalidOperationException("Invalid LinkFileID")
                };

                var paginationMetadata = new
                {
                    TotalRecords = totalRecords,
                    PageSize = pageSize,
                    CurrentPage = pageNumber,
                    TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
                };

                return Ok(new
                {
                    FirstPeriodTotals = new { Balance = firstPeriodBalance, Total = firstPeriodTotals },
                    TransactionsPeriodTotals = new { Balance = results, Total = resultsTotals },
                    LastPeriodTotals = new { Balance = lastPeriodBalance, Total = lastPeriodTotals },
                    Pagination = paginationMetadata
                });
            }
            else
            {

                AccountingTreeChart? account = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == accountID && x.IsDeleted != true);

                if (account == null)
                    return NotFound($"Account with ID: {accountID} not found.");

                if (account.LinkFileID != linkFileID)
                    return BadRequest("The selected account does not match the specified link file ID.");

                var results = await context.Set<AccountBalanceReport>().FromSqlRaw(
                     "EXEC dbo.GetAccountLedger @DateFrom, @DateTo, @MainAccNo, @LinkFileID, @PageNumber, @PageSize",
                     new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                     new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                     new SqlParameter("@MainAccNo", accountID),
                     new SqlParameter("@LinkFileID", linkFileID),
                    new SqlParameter("@PageNumber", pageNumber),
                    new SqlParameter("@PageSize", pageSize)
                 )
                    .AsNoTracking()
                    .ToListAsync();

                if (results == null || !results.Any())
                    return NotFound("No data found.");

                var resultsCredits = results.Sum(x => x.Credit);
                var resultsDebits = results.Sum(x => x.Debit);

                var resultsTotals = new
                {
                    TotalCredit = resultsCredits,
                    TotalDebit = resultsDebits,
                    Difference = isCredit ? resultsCredits - resultsDebits : resultsDebits - resultsCredits
                };

                var firstPeriodBalance = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountLedger @DateFrom, @DateTo, @MainAccNo, @LinkFileID, @PageNumber, @PageSize",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", (object)dateToValue ?? DBNull.Value),
                    new SqlParameter("@MainAccNo", accountID),
                    new SqlParameter("@LinkFileID", linkFileID),
                    new SqlParameter("@PageNumber", pageNumber),
                    new SqlParameter("@PageSize", pageSize)
                )
                    .AsNoTracking()
                    .ToListAsync();

                var fpCredits = isCredit ? firstPeriodBalance.Sum(x => x.Credit) : 0;
                var fpDebits = !isCredit ? firstPeriodBalance.Sum(x => x.Debit) : 0;

                var firstPeriodTotals = new
                {
                    TotalCredit = isCredit ? fpCredits - fpDebits : 0,
                    TotalDebit = !isCredit ? fpDebits - fpCredits : 0,
                    Difference = isCredit ? fpCredits - fpDebits : fpDebits - fpCredits
                };

                List<AccountBalanceReport>? lastPeriodBalance = new();

                for (int i = 0; i < results.Count; i++)
                {
                    lastPeriodBalance.Add(new AccountBalanceReport()
                    {
                        ID = results[i].ID,
                        Name = results[i].Name,
                        Credit = isCredit ?
                            (firstPeriodBalance?.Count() > 0 ?
                            firstPeriodBalance[i].Credit - results[i].Debit :
                            0 - results[i].Debit) + results[i].Credit : 0,
                        Debit = !isCredit ?
                            (firstPeriodBalance?.Count() > 0 ?
                            firstPeriodBalance[i].Debit - results[i].Credit :
                            0 - results[i].Credit) + results[i].Debit : 0
                    });
                }

                totalRecords = linkFileID switch
                {
                    2 => (await context.Suppliers.Where(s => s.AccountNumberID == accountID && s.IsDeleted != true).ToListAsync()).Count(),
                    3 => (await context.Debits.Select(d => d.AccountNumberID == accountID && d.IsDeleted != true).ToListAsync()).Count(),
                    4 => (await context.Credits.Select(c => c.AccountNumberID == accountID && c.IsDeleted != true).ToListAsync()).Count(),
                    5 => (await context.Saves.Select(s => s.AccountNumberID == accountID && s.IsDeleted != true).ToListAsync()).Count(),
                    6 => (await context.Banks.Select(b => b.AccountNumberID == accountID && b.IsDeleted != true).ToListAsync()).Count(),
                    7 => (await context.Incomes.Select(i => i.AccountNumberID == accountID && i.IsDeleted != true).ToListAsync()).Count(),
                    8 => (await context.Outcomes.Select(o => o.AccountNumberID == accountID && o.IsDeleted != true).ToListAsync()).Count(),
                    9 => (await context.Assets.Select(a => a.AccountNumberID == accountID && a.IsDeleted != true).ToListAsync()).Count(),
                    10 => (await context.Employee.Select(e => e.AccountNumberID == accountID && e.IsDeleted != true).ToListAsync()).Count(),
                    11 => (await context.TuitionFeesTypes.Select(t => t.AccountNumberID == accountID && t.IsDeleted != true).ToListAsync()).Count(),
                    12 => (await context.TuitionDiscountTypes.Select(t => t.AccountNumberID == accountID && t.IsDeleted != true).ToListAsync()).Count(),
                    13 => (await context.Student.Select(s => s.AccountNumberID == accountID && s.IsDeleted != true).ToListAsync()).Count(),
                    _ => throw new InvalidOperationException("Invalid LinkFileID")
                };

                var lastPeriodTotals = new
                {
                    TotalCredit = isCredit ? fpCredits + resultsCredits - resultsDebits : 0,
                    TotalDebit = !isCredit ? fpDebits + resultsDebits - resultsCredits : 0,
                    Difference = isCredit ? fpCredits - fpDebits : fpDebits - fpCredits
                };

                var paginationMetadata = new
                {
                    TotalRecords = totalRecords,
                    PageSize = pageSize,
                    CurrentPage = pageNumber,
                    TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
                };

                return Ok(new
                {
                    FirstPeriodTotals = new { Balance = firstPeriodBalance, Total = firstPeriodTotals },
                    TransactionsPeriodTotals = new { Balance = results, Total = resultsTotals },
                    LastPeriodTotals = new { Balance = lastPeriodBalance, Total = lastPeriodTotals },
                    Pagination = paginationMetadata
                });
            }
        }
        #endregion

    }
}
