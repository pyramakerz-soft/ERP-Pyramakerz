using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.AccountingModule.Reports;
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

        #region Suppliers Balances
        [HttpGet("GetSuppliersBalance")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "" }
        )]
        public async Task<IActionResult> GetSuppliersBalance(DateTime? toDate, long? mainAccountID = 0, bool zeroBalance = true, bool positiveBalance = true, bool negativeBalance = true, int pageNumber = 1, int pageSize = 10)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            int startRow = ((pageNumber - 1) * pageSize) + 1;
            int endRow = pageNumber * pageSize;

            List<AccountBalanceReport>? suppliersBalances = new();
            AccountTotals totals = new();
            AccountTotals allTotals = new();
            long totalRecords = 0;
            DateTime baseDate = new DateTime(1900, 1, 1);

            if (mainAccountID == 0)
            {
                List<AccountingTreeChart>? accounts = await Unit_Of_Work.accountingTreeChart_Repository.SelectQuery<AccountingTreeChart>(x => x.IsDeleted != true && x.LinkFileID == 2).ToListAsync();

                if (accounts == null || accounts.Count == 0)
                {
                    return NotFound("No accounts found.");
                }

                List<Supplier> suppliers = await Unit_Of_Work.supplier_Repository.SelectQuery<Supplier>(x => x.IsDeleted != true).ToListAsync();

                if (suppliers == null || suppliers.Count == 0)
                {
                    return NotFound("No suppliers found.");
                }

                var temp = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountSummary @DateFrom, @DateTo, 0, 0, 2, @zeroBalance, @positiveBalance, @negativeBalance, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
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
                    suppliersBalances.AddRange(temp);
                }

                if (suppliersBalances == null || suppliersBalances.Count == 0)
                    return NotFound($"No suppliers found.");

                allTotals.TotalDebit = suppliersBalances.Sum(x => x.Debit ?? 0);
                allTotals.TotalCredit = suppliersBalances.Sum(x => x.Credit ?? 0);

                allTotals.Differences = allTotals.TotalCredit - allTotals.TotalDebit;

                totalRecords = (await context.Set<CountResult>()
                    .FromSqlInterpolated($@"
                    SELECT ID from Suppliers")
                    .ToListAsync())
                    .Count();
                
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
                    suppliersBalances.AddRange(temp);
                }

                if (suppliersBalances == null || suppliersBalances.Count == 0)
                    return NotFound($"No suppliers found.");

                totalRecords = (await context.Set<CountResult>()
                    .FromSqlInterpolated($@"
                        SELECT ID from Suppliers WHERE AccountNumberID = {mainAccountID}")
                    .ToListAsync())
                    .Count();

                allTotals.TotalDebit = suppliersBalances.Sum(x => x.Debit ?? 0);
                allTotals.TotalCredit = suppliersBalances.Sum(x => x.Credit ?? 0);

                allTotals.Differences = allTotals.TotalCredit - allTotals.TotalDebit;
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
                Data = suppliersBalances,
                Totals = allTotals,
                Pagination = paginationMetadata
            });
        }
        #endregion

        #region Safes Balances
        [HttpGet("GetSafesBalance")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "" }
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
            pages: new[] { "" }
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
