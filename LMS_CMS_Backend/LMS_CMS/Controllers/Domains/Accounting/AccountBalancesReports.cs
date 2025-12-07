using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
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
            pages: new[] { "Account Balance Report" }
        )]
        public async Task<IActionResult> GetAccountBalance(DateTime? toDate, long linkFileID, long? accountID = 0, bool zeroBalance = true, bool positiveBalance = true, bool negativeBalance = true, int pageNumber = 1, int pageSize = 10)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            List<AccountBalanceReport>? accountBalances = new();
            AccountTotals allTotals = new();
            long? totalRecords = 0;

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

                foreach (var item in accountBalances)
                {
                    if (isCredit && item.Credit < 0)
                    {
                        item.Debit = item.Credit * -1;
                        item.Credit = 0;
                    }
                    else if (!isCredit && item.Debit < 0)
                    {
                        item.Credit = item.Debit * -1;
                        item.Debit = 0;
                    }
                }

                allTotals.TotalDebit = accountBalances.Sum(x => x.Debit);
                allTotals.TotalCredit = accountBalances.Sum(x => x.Credit);

                allTotals.Differences = isCredit ? allTotals.TotalCredit - allTotals.TotalDebit : allTotals.TotalDebit - allTotals.TotalCredit;

                totalRecords = linkFileID switch
                {
                    2 => (await context.Suppliers.Where(s => s.IsDeleted != true).ToListAsync()).Count(),
                    3 => (await context.Debits.Where(d => d.IsDeleted != true).ToListAsync()).Count(),
                    4 => (await context.Credits.Where(c => c.IsDeleted != true).ToListAsync()).Count(),
                    5 => (await context.Saves.Where(s => s.IsDeleted != true).ToListAsync()).Count(),
                    6 => (await context.Banks.Where(b => b.IsDeleted != true).ToListAsync()).Count(),
                    7 => (await context.Incomes.Where(i => i.IsDeleted != true).ToListAsync()).Count(),
                    8 => (await context.Outcomes.Where(o => o.IsDeleted != true).ToListAsync()).Count(),
                    9 => (await context.Assets.Where(a => a.IsDeleted != true).ToListAsync()).Count(),
                    10 => (await context.Employee.Where(e => e.IsDeleted != true).ToListAsync()).Count(),
                    11 => (await context.TuitionFeesTypes.Where(t => t.IsDeleted != true).ToListAsync()).Count(),
                    12 => (await context.TuitionDiscountTypes.Where(t => t.IsDeleted != true).ToListAsync()).Count(),
                    13 => (await context.Student.Where(s => s.IsDeleted != true).ToListAsync()).Count(),
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

                foreach (var item in accountBalances)
                {
                    if (isCredit && item.Credit < 0)
                    {
                        item.Debit = item.Credit * -1;
                        item.Credit = 0;
                    }
                    else if (!isCredit && item.Debit < 0)
                    {
                        item.Credit = item.Debit * -1;
                        item.Debit = 0;
                    }
                }

                totalRecords = linkFileID switch
                {
                    2 => (await context.Suppliers.Where(s => s.AccountNumberID == accountID && s.IsDeleted != true).ToListAsync()).Count(),
                    3 => (await context.Debits.Where(d => d.AccountNumberID == accountID && d.IsDeleted != true).ToListAsync()).Count(),
                    4 => (await context.Credits.Where(c => c.AccountNumberID == accountID && c.IsDeleted != true).ToListAsync()).Count(),
                    5 => (await context.Saves.Where(s => s.AccountNumberID == accountID && s.IsDeleted != true).ToListAsync()).Count(),
                    6 => (await context.Banks.Where(b => b.AccountNumberID == accountID && b.IsDeleted != true).ToListAsync()).Count(),
                    7 => (await context.Incomes.Where(i => i.AccountNumberID == accountID && i.IsDeleted != true).ToListAsync()).Count(),
                    8 => (await context.Outcomes.Where(o => o.AccountNumberID == accountID && o.IsDeleted != true).ToListAsync()).Count(),
                    9 => (await context.Assets.Where(a => a.AccountNumberID == accountID && a.IsDeleted != true).ToListAsync()).Count(),
                    10 => (await context.Employee.Where(e => e.AccountNumberID == accountID && e.IsDeleted != true).ToListAsync()).Count(),
                    11 => (await context.TuitionFeesTypes.Where(t => t.AccountNumberID == accountID && t.IsDeleted != true).ToListAsync()).Count(),
                    12 => (await context.TuitionDiscountTypes.Where(t => t.AccountNumberID == accountID && t.IsDeleted != true).ToListAsync()).Count(),
                    13 => (await context.Student.Where(s => s.AccountNumberID == accountID && s.IsDeleted != true).ToListAsync()).Count(),
                    _ => throw new InvalidOperationException("Invalid LinkFileID")
                };

                allTotals.TotalDebit = accountBalances.Sum(x => x.Debit);
                allTotals.TotalCredit = accountBalances.Sum(x => x.Credit);

                allTotals.Differences = isCredit ? allTotals.TotalCredit - allTotals.TotalDebit : allTotals.TotalDebit - allTotals.TotalCredit;
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
