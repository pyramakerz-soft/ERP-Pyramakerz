using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.AccountingModule.Reports;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;

namespace LMS_CMS_PL.Controllers.Domains.Accounting
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    public class AccountBalancesReports : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public AccountBalancesReports(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }

        #region Account Balances
        [HttpGet("GetAccountBalance")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Accounts Balances" }
        )]
        public async Task<IActionResult> GetAccountBalance(DateTime? toDate, long linkFileID, long? accountID = 0, bool zeroBalance = true, bool positiveBalance = true, bool negativeBalance = true, int pageNumber = 1, int pageSize = 10)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            List<AccountBalanceReport>? accountBalances = new();
            AccountTotals totals = new();
            AccountTotals allTotals = new();
            long? totalRecords = 0;
            DateTime baseDate = new DateTime(1900, 1, 1);

            bool isCredit = linkFileID switch
            {
                2 or 4 or 7 or 10 or 11 => true,
                _ => false
            };

            if (accountID == 0)
            {
                accountBalances = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountBalance @DateTo, 0, @linkFileID, @zeroBalance, @positiveBalance, @negativeBalance, @PageNumber, @PageSize",
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@linkFileID", linkFileID),
                    new SqlParameter("@zeroBalance", zeroBalance),
                    new SqlParameter("@positiveBalance", positiveBalance),
                    new SqlParameter("@negativeBalance", negativeBalance),
                    new SqlParameter("@PageNumber", pageNumber),
                    new SqlParameter("@PageSize", pageSize)
                )
                .AsNoTracking()
                .ToListAsync();

                if (accountBalances == null || accountBalances.Count == 0)
                    return NotFound($"No account found.");

                allTotals.TotalDebit = accountBalances.Sum(x => x.Debit ?? 0);
                allTotals.TotalCredit = accountBalances.Sum(x => x.Credit ?? 0);

                allTotals.Differences = isCredit ? allTotals.TotalCredit - allTotals.TotalDebit : allTotals.TotalDebit - allTotals.TotalCredit;

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

            }
            else
            {
                AccountingTreeChart? mainAccount = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == accountID && x.IsDeleted != true);

                if (mainAccount == null)
                    return NotFound($"Main account with ID: {accountID} not found.");

                accountBalances = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountBalance @DateTo, @MainAccNo, @linkFileID, @zeroBalance, @positiveBalance, @negativeBalance, @PageNumber, @PageSize",
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@MainAccNo", accountID),
                    new SqlParameter("@linkFileID", linkFileID),
                    new SqlParameter("@zeroBalance", zeroBalance),
                    new SqlParameter("@positiveBalance", positiveBalance),
                    new SqlParameter("@negativeBalance", negativeBalance),
                    new SqlParameter("@PageNumber", pageNumber),
                    new SqlParameter("@PageSize", pageSize)
                )
                .AsNoTracking()
                .ToListAsync();

                if (accountBalances == null || accountBalances.Count == 0)
                    return NotFound($"No accounts found.");

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

                allTotals.TotalDebit = accountBalances.Sum(x => x.Debit ?? 0);
                allTotals.TotalCredit = accountBalances.Sum(x => x.Credit ?? 0);

                allTotals.Differences = isCredit ? allTotals.TotalCredit - allTotals.TotalDebit : allTotals.TotalDebit - allTotals.TotalDebit;
            }

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling((double)totalRecords / (double)pageSize)
            };

            return Ok(new
            {
                Data = accountBalances,
                Totals = allTotals,
                Pagination = paginationMetadata
            });
        }
        #endregion
    }
}
