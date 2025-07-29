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
        public async Task<IActionResult> GetSupplierStatement(DateTime? toDate, long? supplierID = 0, bool groupedByAccount = false, bool hasBalance = true, bool zeroBalance = true, bool negativeBalance = true, int pageNumber = 1, int pageSize = 10)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            int startRow = ((pageNumber - 1) * pageSize) + 1;
            int endRow = pageNumber * pageSize;

            List<AccountBalanceReport>? suppliersBalances = new();
            AccountTotals totals = new();
            AccountTotals allTotals = new();

            if (supplierID == 0)
            {
                List<Supplier> suppliers = await Unit_Of_Work.supplier_Repository.SelectQuery<Supplier>(x => x.IsDeleted != true).ToListAsync();

                if (suppliers == null || suppliers.Count == 0)
                {
                    return NotFound("No suppliers found.");
                }

                foreach (var supplier in suppliers)
                {
                    var temp = await context.Set<AccountBalanceReport>().FromSqlRaw(
                        "EXEC dbo.GetSupplierAccountSummary @DateFrom, @DateTo, @MainAccNo, @SubAccNo, @linkFileID, @StartRow, @EndRow",
                        new SqlParameter("@DateFrom", "1900-1-1"),
                        new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                        new SqlParameter("@MainAccNo", supplier.AccountNumberID),
                        new SqlParameter("@SubAccNo", supplier.ID),
                        new SqlParameter("@linkFileID", 2),
                        new SqlParameter("@StartRow", startRow),
                        new SqlParameter("@EndRow", endRow)
                    ).ToListAsync();

                    if (temp != null || temp?.Count > 0)
                    {
                        suppliersBalances.AddRange(temp);
                    }

                    totals = (await context.Set<AccountTotals>().FromSqlRaw(
                        "EXEC dbo.GetAccountingTotals @DateFrom, @DateTo, @MainAccNo, @SubAccNo, @LinkFileID",
                        new SqlParameter("@DateFrom", "1900-1-1"),
                        new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                        new SqlParameter("@MainAccNo", supplier.AccountNumberID),
                        new SqlParameter("@SubAccNo", supplier.ID),
                        new SqlParameter("@linkFileID", 2)
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
            }
            else
            {
                Supplier supplier = Unit_Of_Work.supplier_Repository.First_Or_Default(s => s.ID == supplierID && s.IsDeleted != true);

                if (supplier == null)
                    return NotFound($"Supplier with ID: {supplierID} not fount");

                suppliersBalances = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetSupplierAccountSummary @DateFrom, @DateTo, @MainAccNo, @SubAccNo, @linkFileID, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@MainAccNo", supplier.AccountNumberID),
                    new SqlParameter("@SubAccNo", supplierID),
                    new SqlParameter("@linkFileID", 2),
                    new SqlParameter("@StartRow", startRow),
                    new SqlParameter("@EndRow", endRow)
                ).ToListAsync();

                totals = (await context.Set<AccountTotals>().FromSqlRaw(
                    "EXEC dbo.GetAccountingTotals @DateFrom, @DateTo, @MainAccNo, @SubAccNo, @LinkFileID",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@MainAccNo", supplier.AccountNumberID),
                    new SqlParameter("@SubAccNo", supplierID),
                    new SqlParameter("@linkFileID", 2)
                )
                .AsNoTracking()
                .ToListAsync()).
                FirstOrDefault();

                if (totals != null)
                {
                    allTotals.TotalDebit = totals.TotalDebit ?? 0;
                    allTotals.TotalCredit = totals.TotalCredit ?? 0;
                    allTotals.Differences = totals.Differences ?? 0;
                }
            }

            return Ok(new
            {
                Data = suppliersBalances,
                Totals = allTotals
            });
        }
        #endregion

        #region Safes Balances
        [HttpGet("GetSafesStatement")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "" }
        )]
        public async Task<IActionResult> GetSafesStatement(DateTime? toDate, long? safeID = 0, bool groupedByAccount = false, bool hasBalance = true, bool zeroBalance = true, bool negativeBalance = true, int pageNumber = 1, int pageSize = 10)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            int startRow = ((pageNumber - 1) * pageSize) + 1;
            int endRow = pageNumber * pageSize;

            List<AccountBalanceReport>? safesBalances = new();
            AccountTotals totals = new();
            AccountTotals allTotals = new();

            if (safeID == 0)
            {
                List<Save> safes = await Unit_Of_Work.save_Repository.SelectQuery<Save>(x => x.IsDeleted != true).ToListAsync();

                if (safes == null || safes.Count == 0)
                {
                    return NotFound("No safes found.");
                }

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
                    ).ToListAsync();

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
            }
            else
            {
                Save safe = Unit_Of_Work.save_Repository.First_Or_Default(s => s.ID == safeID && s.IsDeleted != true);

                if (safe == null)
                    return NotFound($"Safe with ID: {safeID} not fount");

                safesBalances = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetSupplierAccountSummary @DateFrom, @DateTo, @MainAccNo, @SubAccNo, @linkFileID, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@MainAccNo", safe.AccountNumberID),
                    new SqlParameter("@SubAccNo", safe.ID),
                    new SqlParameter("@linkFileID", 5),
                    new SqlParameter("@StartRow", startRow),
                    new SqlParameter("@EndRow", endRow)
                ).ToListAsync();

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

            return Ok(new
            {
                Data = safesBalances,
                Totals = allTotals
            });
        }
        #endregion
    }
}
