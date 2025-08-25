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
            pages: new[] { "Accounts Balances" }
        )]
        public async Task<IActionResult> GetAccountBalance(long linkFileID, DateTime? toDate, long? mainAccountID = 0, bool zeroBalance = true, bool positiveBalance = true, bool negativeBalance = true, int pageNumber = 1, int pageSize = 10)
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



            if (mainAccountID == 0)
            {
                List<AccountingTreeChart>? accounts = await Unit_Of_Work.accountingTreeChart_Repository.SelectQuery<AccountingTreeChart>(x => x.IsDeleted != true && x.LinkFileID == linkFileID).ToListAsync();

                if (accounts == null || accounts.Count == 0)
                {
                    return NotFound("No accounts found.");
                }

                var temp = await context.Set<AccountBalanceReport>().FromSqlRaw(
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

                if (temp != null || temp?.Count > 0)
                {
                    accountBalances.AddRange(temp);
                }

                if (accountBalances == null || accountBalances.Count == 0)
                    return NotFound($"No account found.");

                allTotals.TotalDebit = accountBalances.Sum(x => x.Debit ?? 0);
                allTotals.TotalCredit = accountBalances.Sum(x => x.Credit ?? 0);

                allTotals.Differences = isCredit ? allTotals.TotalCredit - allTotals.TotalDebit : allTotals.TotalDebit - allTotals.TotalCredit;

                //List<long> ids = linkFileID switch
                //{
                //    2 => await context.Suppliers.Select(s => s.ID).ToListAsync(),
                //    3 => await context.Debits.Select(d => d.ID).ToListAsync(),
                //    4 => await context.Credits.Select(c => c.ID).ToListAsync(),
                //    5 => await context.Saves.Select(s => s.ID).ToListAsync(),
                //    6 => await context.Banks.Select(b => b.ID).ToListAsync(),
                //    7 => await context.Incomes.Select(i => i.ID).ToListAsync(),
                //    8 => await context.Outcomes.Select(o => o.ID).ToListAsync(),
                //    9 => await context.Assets.Select(a => a.ID).ToListAsync(),
                //    10 => await context.Employee.Select(e => e.ID).ToListAsync(),
                //    11 => await context.TuitionFeesTypes.Select(t => t.ID).ToListAsync(),
                //    12 => await context.TuitionDiscountTypes.Select(t => t.ID).ToListAsync(),
                //    13 => await context.Student.Select(s => s.ID).ToListAsync(),
                //    _ => throw new InvalidOperationException("Invalid LinkFileID")
                //};

                totalRecords = (await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountBalance @DateTo, 0, @linkFileID",
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@linkFileID", linkFileID)
                )
                .AsNoTracking()
                .ToListAsync())
                .Count();

            }
            else
            {
                AccountingTreeChart? mainAccount = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == mainAccountID && x.IsDeleted != true);

                if (mainAccount == null)
                    return NotFound($"Main account with ID: {mainAccountID} not found.");

                var temp = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountBalance @DateTo, @MainAccNo, @linkFileID, @zeroBalance, @positiveBalance, @negativeBalance, @PageNumber, @PageSize",
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@MainAccNo", mainAccountID),
                    new SqlParameter("@linkFileID", linkFileID),
                    new SqlParameter("@zeroBalance", zeroBalance),
                    new SqlParameter("@positiveBalance", positiveBalance),
                    new SqlParameter("@negativeBalance", negativeBalance),
                    new SqlParameter("@PageNumber", pageNumber),
                    new SqlParameter("@PageSize", pageSize)
                )
                .AsNoTracking()
                .ToListAsync();

                if (temp != null || temp?.Count > 0)
                {
                    accountBalances.AddRange(temp);
                }

                if (accountBalances == null || accountBalances.Count == 0)
                    return NotFound($"No accounts found.");

                totalRecords = (await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountBalance @DateTo, @MainAccNo, @linkFileID",
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@MainAccNo", mainAccountID),
                    new SqlParameter("@linkFileID", linkFileID)
                )
                .AsNoTracking()
                .ToListAsync())
                .Count();

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

        #region Safes Balances
        [HttpGet("GetSafesBalance")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Safes Balances" }
        )]
        public async Task<IActionResult> GetSafesBalance(DateTime? toDate, long? mainAccountID = 0, bool zeroBalance = true, bool positiveBalance = true, bool negativeBalance = true, int pageNumber = 1, int pageSize = 10)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            int startRow = ((pageNumber - 1) * pageSize) + 1;
            int endRow = pageNumber * pageSize;

            List<AccountBalanceReport>? safesBalances = new();
            AccountTotals totals = new();
            AccountTotals allTotals = new();
            long totalRecords = 0;
            DateTime baseDate = new DateTime(1900, 1, 1);

            if (mainAccountID == 0)
            {
                List<Save> safes = await Unit_Of_Work.save_Repository.SelectQuery<Save>(x => x.IsDeleted != true).ToListAsync();

                if (safes == null || safes.Count == 0)
                {
                    return NotFound("No safes found.");
                }

                var temp = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountSummary @DateFrom, @DateTo, 0, 0, 5, @zeroBalance, @positiveBalance, @negativeBalance, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@StartRow", startRow),
                    new SqlParameter("@EndRow", endRow),
                    new SqlParameter("@zeroBalance", zeroBalance),
                    new SqlParameter("@positiveBalance", positiveBalance),
                    new SqlParameter("@negativeBalance", negativeBalance)
                )
                .AsNoTracking()
                .ToListAsync();

                if (temp != null || temp?.Count > 0)
                {
                    safesBalances.AddRange(temp);
                }

                if (safesBalances == null || safesBalances.Count == 0)
                    return NotFound($"No safes found.");

                allTotals.TotalDebit = safesBalances.Sum(x => x.Debit ?? 0);
                allTotals.TotalCredit = safesBalances.Sum(x => x.Credit ?? 0);

                allTotals.Differences = allTotals.TotalDebit - allTotals.TotalCredit;

                totalRecords = (await context.Set<CountResult>()
                    .FromSqlInterpolated($@"
                        SELECT ID from Saves")
                    .ToListAsync())
                    .Count();
            }
            else
            {
                AccountingTreeChart? mainAccount = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == mainAccountID && x.IsDeleted != true);

                if (mainAccount == null)
                    return NotFound($"Main account with ID: {mainAccountID} not found.");

                var temp = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountSummary @DateFrom, @DateTo, @MainAccNo, 0, 5, @zeroBalance, @positiveBalance, @negativeBalance, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@MainAccNo", mainAccount.ID),
                    new SqlParameter("@StartRow", startRow),
                    new SqlParameter("@EndRow", endRow),
                    new SqlParameter("@zeroBalance", zeroBalance),
                    new SqlParameter("@positiveBalance", positiveBalance),
                    new SqlParameter("@negativeBalance", negativeBalance)
                )
                .AsNoTracking()
                .ToListAsync();

                if (temp != null || temp?.Count > 0)
                {
                    safesBalances.AddRange(temp);
                }

                if (safesBalances == null || safesBalances.Count == 0)
                    return NotFound($"No safes found.");

                totalRecords = (await context.Set<CountResult>()
                    .FromSqlInterpolated($@"
                        SELECT ID from Saves WHERE AccountNumberID = {mainAccountID}")
                    .ToListAsync())
                    .Count();

                allTotals.TotalDebit = safesBalances.Sum(x => x.Debit ?? 0);
                allTotals.TotalCredit = safesBalances.Sum(x => x.Credit ?? 0);

                allTotals.Differences = allTotals.TotalDebit - allTotals.TotalCredit;
            }

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new
            {
                Data = safesBalances,
                Totals = allTotals,
                Pagination = paginationMetadata
            });
        }
        #endregion

        #region Banks Balances
        [HttpGet("GetBanksBalance")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Banks Balances" }
        )]
        public async Task<IActionResult> GetBanksBalance(DateTime? toDate, long? mainAccountID = 0, bool zeroBalance = true, bool positiveBalance = true, bool negativeBalance = true, int pageNumber = 1, int pageSize = 10)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            int startRow = ((pageNumber - 1) * pageSize) + 1;
            int endRow = pageNumber * pageSize;

            List<AccountBalanceReport>? banksBalances = new();
            AccountTotals totals = new();
            AccountTotals allTotals = new();
            long totalRecords = 0;
            DateTime baseDate = new DateTime(1900, 1, 1);

            if (mainAccountID == 0)
            {
                List<Bank> banks = await Unit_Of_Work.bank_Repository.SelectQuery<Bank>(x => x.IsDeleted != true).ToListAsync();

                if (banks == null || banks.Count == 0)
                {
                    return NotFound("No banks found.");
                }

                var temp = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountSummary @DateFrom, @DateTo, 0, 0, 6, @zeroBalance, @positiveBalance, @negativeBalance, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@StartRow", startRow),
                    new SqlParameter("@EndRow", endRow),
                    new SqlParameter("@zeroBalance", zeroBalance),
                    new SqlParameter("@positiveBalance", positiveBalance),
                    new SqlParameter("@negativeBalance", negativeBalance)
                )
                .AsNoTracking()
                .ToListAsync();

                if (temp != null || temp?.Count > 0)
                {
                    banksBalances.AddRange(temp);
                }

                if (banksBalances == null || banksBalances.Count == 0)
                    return NotFound($"No banks found.");

                allTotals.TotalDebit = banksBalances.Sum(x => x.Debit ?? 0);
                allTotals.TotalCredit = banksBalances.Sum(x => x.Credit ?? 0);

                allTotals.Differences = allTotals.TotalDebit - allTotals.TotalCredit;

                totalRecords = (await context.Set<CountResult>()
                    .FromSqlInterpolated($@"
                        SELECT ID from Banks")
                    .ToListAsync())
                    .Count();
            }
            else
            {
                AccountingTreeChart? mainAccount = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == mainAccountID && x.IsDeleted != true);

                if (mainAccount == null)
                    return NotFound($"Main account with ID: {mainAccountID} not found.");

                var temp = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountSummary @DateFrom, @DateTo, @MainAccNo, 0, 6, @zeroBalance, @positiveBalance, @negativeBalance, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@MainAccNo", mainAccount.ID),
                    new SqlParameter("@StartRow", startRow),
                    new SqlParameter("@EndRow", endRow),
                    new SqlParameter("@zeroBalance", zeroBalance),
                    new SqlParameter("@positiveBalance", positiveBalance),
                    new SqlParameter("@negativeBalance", negativeBalance)
                )
                .AsNoTracking()
                .ToListAsync();

                if (temp != null || temp?.Count > 0)
                {
                    banksBalances.AddRange(temp);
                }

                if (banksBalances == null || banksBalances.Count == 0)
                    return NotFound($"No banks found.");

                totalRecords = (await context.Set<CountResult>()
                    .FromSqlInterpolated($@"
                        SELECT ID from Banks WHERE AccountNumberID = {mainAccountID}")
                    .ToListAsync())
                    .Count();

                allTotals.TotalDebit = banksBalances.Sum(x => x.Debit ?? 0);
                allTotals.TotalCredit = banksBalances.Sum(x => x.Credit ?? 0);

                allTotals.Differences = allTotals.TotalDebit - allTotals.TotalCredit;
            }

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new
            {
                Data = banksBalances,
                Totals = allTotals,
                Pagination = paginationMetadata
            });
        }
        #endregion
    }
}
