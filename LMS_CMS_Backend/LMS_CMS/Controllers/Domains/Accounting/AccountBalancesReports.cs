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
        [HttpGet("GetSupplierStatement")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "" }
        )]
        public async Task<IActionResult> GetSupplierStatement(DateTime? toDate, long? mainAccountID = 0, bool groupedByAccount = false, bool zeroBalance = true, bool positiveBalance = true, bool negativeBalance = true, int pageNumber = 1, int pageSize = 10)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            int startRow = ((pageNumber - 1) * pageSize) + 1;
            int endRow = pageNumber * pageSize;

            List<AccountBalanceReport>? suppliersBalances = new();
            AccountTotals totals = new();
            AccountTotals allTotals = new();
            int totalRecords = 0;
            DateTime baseDate = new DateTime(1900, 1, 1);

            if (mainAccountID == 0)
            {
                List<Supplier> suppliers = await Unit_Of_Work.supplier_Repository.SelectQuery<Supplier>(x => x.IsDeleted != true).ToListAsync();

                if (suppliers == null || suppliers.Count == 0)
                {
                    return NotFound("No suppliers found.");
                }

                var temp = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountSummary @DateFrom, @DateTo, 0, 0, 2, @StartRow, @EndRow, @zeroBalance, @positiveBalance, @negativeBalance",
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
                    suppliersBalances.AddRange(temp);
                }

                totals = (await context.Set<AccountTotals>().FromSqlRaw(
                    "EXEC dbo.GetAccountingTotals @DateFrom, @DateTo, 0, 0, 2, @zeroBalance, @positiveBalance, @negativeBalance",
                    new SqlParameter("@DateFrom", baseDate),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@zeroBalance", zeroBalance),
                    new SqlParameter("@positiveBalance", positiveBalance),
                    new SqlParameter("@negativeBalance", negativeBalance)
                )
                .AsNoTracking()
                .ToListAsync())
                .FirstOrDefault();

                if (totals != null)
                {
                    allTotals.TotalDebit = totals.TotalDebit ?? 0;
                    allTotals.TotalCredit = totals.TotalCredit ?? 0;
                    allTotals.Differences = totals.Differences ?? 0;
                }

                if (suppliersBalances == null || suppliersBalances?.Count == 0)
                    return NotFound($"No suppliers found.");

                totalRecords = (await context.Set<CountResult>()
                    .FromSqlInterpolated($@"
                        SELECT dbo.GetEntriesCount({baseDate}, {toDate}, 0, 0, 2) AS TotalCount")
                    .ToListAsync())
                    .FirstOrDefault()?.TotalCount ?? 0;
            }
            else
            {
                AccountingTreeChart? mainAccount = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == mainAccountID && x.IsDeleted != true);

                if (mainAccount == null)
                    return NotFound($"Main account with ID: {mainAccountID} not found.");

                List<Supplier>? suppliers = await Unit_Of_Work.supplier_Repository.SelectQuery<Supplier>(x => x.AccountNumberID == mainAccountID && x.IsDeleted != true).ToListAsync();

                if (suppliers == null || suppliers?.Count == 0)
                    return NotFound($"No suppliers in account with ID: {mainAccountID}.");

                foreach (var supplier in suppliers)
                {
                    var temp = await context.Set<AccountBalanceReport>().FromSqlRaw(
                        "EXEC dbo.GetAccountSummary @DateFrom, @DateTo, @MainAccNo, 0, 2, @StartRow, @EndRow, @zeroBalance, @positiveBalance, @negativeBalance",
                        new SqlParameter("@DateFrom", "1900-1-1"),
                        new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                        new SqlParameter("@MainAccNo", mainAccountID),
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

                    totals = (await context.Set<AccountTotals>().FromSqlRaw(
                        "EXEC dbo.GetAccountingTotals @DateFrom, @DateTo, @MainAccNo, 0, 2, @zeroBalance, @positiveBalance, @negativeBalance",
                        new SqlParameter("@DateFrom", "1900-1-1"),
                        new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                        new SqlParameter("@MainAccNo", mainAccountID),
                        new SqlParameter("@zeroBalance", zeroBalance),
                        new SqlParameter("@positiveBalance", positiveBalance),
                        new SqlParameter("@negativeBalance", negativeBalance)
                    )
                    .AsNoTracking()
                    .ToListAsync()).
                    FirstOrDefault();

                    if (totals != null)
                    {
                        allTotals.TotalDebit += totals.TotalDebit ?? 0;
                        allTotals.TotalCredit += totals.TotalCredit ?? 0;
                        allTotals.Differences += totals.Differences ?? 0;
                    }

                    totalRecords = (await context.Set<CountResult>()
                        .FromSqlInterpolated($@"
                            SELECT dbo.GetEntriesCount({baseDate}, {toDate}, {mainAccount.ID}, {supplier.ID}, 2) AS TotalCount")
                        .ToListAsync())
                        .FirstOrDefault()?.TotalCount ?? 0;
                }

                if (suppliersBalances == null || suppliersBalances?.Count == 0)
                    return NotFound($"No suppliers found.");
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
        [HttpGet("GetSafesStatement")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "" }
        )]
        public async Task<IActionResult> GetSafesStatement(DateTime? toDate, long? mainAccountID = 0, bool groupedByAccount = false, bool hasBalance = true, bool zeroBalance = true, bool negativeBalance = true, int pageNumber = 1, int pageSize = 10)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            int startRow = ((pageNumber - 1) * pageSize) + 1;
            int endRow = pageNumber * pageSize;

            List<AccountBalanceReport>? safesBalances = new();
            AccountTotals totals = new();
            AccountTotals allTotals = new();

            if (mainAccountID == 0)
            {
                List<Save> safes = await Unit_Of_Work.save_Repository.SelectQuery<Save>(x => x.IsDeleted != true).ToListAsync();

                if (safes == null || safes.Count == 0)
                {
                    return NotFound("No safes found.");
                }

                foreach (var safe in safes)
                {
                    var temp = await context.Set<AccountBalanceReport>().FromSqlRaw(
                        "EXEC GetAccountSummary @DateFrom, @DateTo, @MainAccNo, @SubAccNo, @linkFileID, @StartRow, @EndRow",
                        new SqlParameter("@DateFrom", "1900-1-1"),
                        new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                        new SqlParameter("@MainAccNo", safe.AccountNumberID),
                        new SqlParameter("@SubAccNo", safe.ID),
                        new SqlParameter("@linkFileID", 5),
                        new SqlParameter("@StartRow", startRow),
                        new SqlParameter("@EndRow", endRow)
                    )
                    .AsNoTracking()
                    .ToListAsync();

                    if (temp != null || temp?.Count > 0)
                    {
                        safesBalances.AddRange(temp);
                    }

                    totals = (await context.Set<AccountTotals>().FromSqlRaw(
                        "EXEC dbo.GetAccountingTotals @DateFrom, @DateTo, @MainAccNo, @SubAccNo, @LinkFileID",
                        new SqlParameter("@DateFrom", "1900-1-1"),
                        new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                        new SqlParameter("@MainAccNo", safe.AccountNumberID),
                        new SqlParameter("@SubAccNo", safe.ID),
                        new SqlParameter("@linkFileID", 5)
                    )
                    .AsNoTracking()
                    .ToListAsync())
                    .FirstOrDefault();

                    if (totals != null)
                    {
                        allTotals.TotalDebit += totals.TotalDebit ?? 0;
                        allTotals.TotalCredit += totals.TotalCredit ?? 0;
                        allTotals.Differences += totals.Differences ?? 0;
                    }
                }

                if (safesBalances == null || safesBalances?.Count == 0)
                    return NotFound($"No safes found.");
            }
            else
            {
                AccountingTreeChart? mainAccount = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == mainAccountID && x.IsDeleted != true);

                if (mainAccount == null)
                    return NotFound($"Main account with ID: {mainAccountID} not found.");

                List<Save>? safes = await Unit_Of_Work.save_Repository.SelectQuery<Save>(x => x.AccountNumberID == mainAccountID && x.IsDeleted != true).ToListAsync();

                if (safes == null || safes?.Count == 0)
                    return NotFound($"No safes in account with ID: {mainAccountID}.");

                foreach (var safe in safes)
                {
                    var temp = await context.Set<AccountBalanceReport>().FromSqlRaw(
                        "EXEC dbo.GetSupplierAccountSummary @DateFrom, @DateTo, @MainAccNo, @SubAccNo, @linkFileID, @StartRow, @EndRow",
                        new SqlParameter("@DateFrom", "1900-1-1"),
                        new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                        new SqlParameter("@MainAccNo", safe.AccountNumberID),
                        new SqlParameter("@SubAccNo", safe.ID),
                        new SqlParameter("@linkFileID", 5),
                        new SqlParameter("@StartRow", startRow),
                        new SqlParameter("@EndRow", endRow)
                    )
                    .AsNoTracking()
                    .ToListAsync();

                    if (temp != null || temp?.Count > 0)
                    {
                        safesBalances.AddRange(temp);
                    }

                    totals = (await context.Set<AccountTotals>().FromSqlRaw(
                        "EXEC dbo.GetAccountingTotals @DateFrom, @DateTo, @MainAccNo, @SubAccNo, @LinkFileID",
                        new SqlParameter("@DateFrom", "1900-1-1"),
                        new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                        new SqlParameter("@MainAccNo", safe.AccountNumberID),
                        new SqlParameter("@SubAccNo", safe.ID),
                        new SqlParameter("@linkFileID", 5)
                    )
                    .AsNoTracking()
                    .ToListAsync())
                    .FirstOrDefault();

                    if (totals != null)
                    {
                        allTotals.TotalDebit = totals.TotalDebit ?? 0;
                        allTotals.TotalCredit = totals.TotalCredit ?? 0;
                        allTotals.Differences = totals.Differences ?? 0;
                    }
                }

                if (safesBalances == null || safesBalances?.Count == 0)
                    return NotFound($"No safes found.");
            }

            return Ok(new
            {
                Data = safesBalances,
                Totals = allTotals
            });
        }
        #endregion
    }
}
