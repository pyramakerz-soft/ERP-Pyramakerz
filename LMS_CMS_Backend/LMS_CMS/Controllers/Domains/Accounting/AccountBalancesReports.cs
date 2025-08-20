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

            int startRow = ((pageNumber - 1) * pageSize) + 1;
            int endRow = pageNumber * pageSize;

            List<AccountBalanceReport>? accountBalances = new();
            AccountTotals totals = new();
            AccountTotals allTotals = new();
            long? totalRecords = 0;
            DateTime baseDate = new DateTime(1900, 1, 1);

            if (mainAccountID == 0)
            {
                List<AccountingTreeChart>? accounts = await Unit_Of_Work.accountingTreeChart_Repository.SelectQuery<AccountingTreeChart>(x => x.IsDeleted != true && x.LinkFileID == linkFileID).ToListAsync();

                if (accounts == null || accounts.Count == 0)
                {
                    return NotFound("No accounts found.");
                }

                var temp = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountSummary @DateFrom, @DateTo, 0, 0, @linkFileID, @zeroBalance, @positiveBalance, @negativeBalance, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@linkFileID", linkFileID),
                    new SqlParameter("@zeroBalance", zeroBalance),
                    new SqlParameter("@positiveBalance", positiveBalance),
                    new SqlParameter("@negativeBalance", negativeBalance),
                    new SqlParameter("@StartRow", startRow),
                    new SqlParameter("@EndRow", endRow)
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

                allTotals.Differences = allTotals.TotalCredit - allTotals.TotalDebit;

                string tableName = linkFileID switch
                {
                    2 => "Suppliers",
                    3 => "Debits",
                    4 => "Credits",
                    5 => "Saves",
                    6 => "Banks",
                    7 => "Incomes",
                    8 => "Outcomes",
                    9 => "Assets",
                    10 => "Employee",
                    11 => "TuitionFeesTypes",
                    12 => "TuitionDiscountTypes",
                    13 => "Student",
                    _ => throw new InvalidOperationException("Invalid LinkFileID")
                };

                totalRecords = (await context.Set<CountResult>()
                    .FromSqlRaw($@"SELECT COUNT_BIG(ID) AS TotalCount FROM {tableName}")
                    .ToListAsync())
                    .FirstOrDefault()?.TotalCount;

            }
            else
            {
                AccountingTreeChart? mainAccount = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == mainAccountID && x.IsDeleted != true);

                if (mainAccount == null)
                    return NotFound($"Main account with ID: {mainAccountID} not found.");

                var temp = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountSummary @DateFrom, @DateTo, @MainAccNo, 0, 2, @zeroBalance, @positiveBalance, @negativeBalance, @StartRow, @EndRow",
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
                    accountBalances.AddRange(temp);
                }

                if (accountBalances == null || accountBalances.Count == 0)
                    return NotFound($"No suppliers found.");

                totalRecords = (await context.Set<CountResult>()
                    .FromSqlInterpolated($@"
                        SELECT ID from Suppliers WHERE AccountNumberID = {mainAccountID}")
                    .ToListAsync())
                    .Count();

                allTotals.TotalDebit = accountBalances.Sum(x => x.Debit ?? 0);
                allTotals.TotalCredit = accountBalances.Sum(x => x.Credit ?? 0);

                allTotals.Differences = allTotals.TotalCredit - allTotals.TotalDebit;
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
