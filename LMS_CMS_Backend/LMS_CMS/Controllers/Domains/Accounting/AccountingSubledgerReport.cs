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

        #region Suppliers Subledger
        [HttpGet("GetSuppliersLedger")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Suppliers Subledger" }
        )]
        public async Task<IActionResult> GetSuppliersLedger(DateTime? fromDate, DateTime? toDate, long? accountID = 0, int pageNumber = 1, int pageSize = 10)
        {
            if (fromDate.HasValue && toDate.HasValue && toDate < fromDate)
                return BadRequest("Start date must be equal or greater than End date");

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            int startRow = ((pageNumber - 1) * pageSize) + 1;
            int endRow = pageNumber * pageSize;
            var dateToValue = fromDate.Value.AddDays(-1);
            TotalResult calcFirstPeriod;

            if (accountID == 0)
            {
                List<Supplier>? suppliers = await Unit_Of_Work.supplier_Repository.SelectQuery<Supplier>(x => x.IsDeleted != true).ToListAsync();

                if (suppliers == null || suppliers.Count == 0)
                    return NotFound("No suppliers accounts found.");

                var results = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountLedger @DateFrom, @DateTo, 0, @LinkFileID, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                    new SqlParameter("@LinkFileID", 2),
                    new SqlParameter("@StartRow", startRow),
                    new SqlParameter("@EndRow", endRow)
                ).ToListAsync(); 

                if (results == null || !results.Any())
                    return NotFound("No data found for the specified date range.");

                var resultsTotals = new
                {
                    TotalCredit = results.Sum(x => x.Credit) ?? 0,
                    TotalDebit = results.Sum(x => x.Debit) ?? 0,
                    Difference = results.Sum(x => x.Credit) ?? 0 - results.Sum(x => x.Debit) ?? 0
                };

                var firstPeriodBalance = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountLedger @DateFrom, @DateTo, 0, @LinkFileID, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", (object)dateToValue ?? DBNull.Value),
                    new SqlParameter("@LinkFileID", 2),
                    new SqlParameter("@StartRow", startRow),
                    new SqlParameter("@EndRow", endRow)
                ).ToListAsync();

                var firstPeriodTotals = new
                {
                    TotalCredit = firstPeriodBalance.Sum(x => x.Credit) ?? 0 - firstPeriodBalance.Sum(x => x.Debit) ?? 0,
                    TotalDebit = 0,
                    Difference = firstPeriodBalance.Sum(x => x.Credit) ?? 0 - firstPeriodBalance.Sum(x => x.Debit) ?? 0
                };

                List<AccountBalanceReport>? lastPeriodBalance = new();

                for (int i = 0; i < results.Count; i++)
                {
                    lastPeriodBalance.Add(new AccountBalanceReport()
                    {
                        ID = results[i].ID,
                        Name = results[i].Name,
                        Credit = (firstPeriodBalance[i].Credit - results[i].Debit) + results[i].Credit,
                        Debit = 0
                    });
                }

                var lastPeriodTotals = new
                {
                    TotalCredit = lastPeriodBalance.Sum(x => x.Credit) ?? 0 - lastPeriodBalance.Sum(x => x.Debit) ?? 0,
                    TotalDebit = 0,
                    Difference = lastPeriodBalance.Sum(x => x.Credit) ?? 0 - lastPeriodBalance.Sum(x => x.Debit) ?? 0
                };

                long totalRecords = suppliers.Count;

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
                    LastPeriodTotals = new { Bakance = lastPeriodBalance, Total = lastPeriodTotals },
                    Pagination = paginationMetadata
                });
            }
            else
            {

                AccountingTreeChart? account = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == accountID && x.IsDeleted != true);

                if (account == null)
                    return NotFound($"Account with ID: {accountID} not found.");

                List<Supplier> suppliers = await Unit_Of_Work.supplier_Repository.SelectQuery<Supplier>(x => x.IsDeleted != true && x.AccountNumberID == accountID).ToListAsync();

                if (suppliers == null || !suppliers.Any())
                    return NotFound("No suppliers found.");

                var results = await context.Set<AccountBalanceReport>().FromSqlRaw(
                     "EXEC dbo.GetAccountLedger @DateFrom, @DateTo, @AccountId, @LinkFileID, @StartRow, @EndRow",
                     new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                     new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                     new SqlParameter("@AccountId", accountID),
                     new SqlParameter("@LinkFileID", 2),
                     new SqlParameter("@StartRow", startRow),
                     new SqlParameter("@EndRow", endRow)
                 ).ToListAsync();

                if (results == null || !results.Any())
                    return NotFound("No data found for the specified date range.");

                var resultsTotals = new
                {
                    TotalCredit = results.Sum(x => x.Credit) ?? 0,
                    TotalDebit = results.Sum(x => x.Debit) ?? 0,
                    Difference = results.Sum(x => x.Credit) ?? 0 - results.Sum(x => x.Debit) ?? 0
                };

                var firstPeriodBalance = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountLedger @DateFrom, @DateTo, @AccountId, @LinkFileID, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", (object)dateToValue ?? DBNull.Value),
                    new SqlParameter("@AccountId", accountID),
                    new SqlParameter("@LinkFileID", 2),
                    new SqlParameter("@StartRow", startRow),
                    new SqlParameter("@EndRow", endRow)
                ).ToListAsync();

                var firstPeriodTotals = new
                {
                    TotalCredit = firstPeriodBalance.Sum(x => x.Credit) ?? 0 - firstPeriodBalance.Sum(x => x.Debit) ?? 0,
                    TotalDebit = 0,
                    Difference = firstPeriodBalance.Sum(x => x.Credit) ?? 0 - firstPeriodBalance.Sum(x => x.Debit) ?? 0
                };

                List<AccountBalanceReport>? lastPeriodBalance = new();

                for (int i = 0; i < results.Count; i++)
                {
                    lastPeriodBalance.Add(new AccountBalanceReport()
                    {
                        ID = results[i].ID,
                        Name = results[i].Name,
                        Credit = (firstPeriodBalance[i].Credit - results[i].Debit) + results[i].Credit,
                        Debit = 0
                    });
                }

                var lastPeriodTotals = new
                {
                    TotalCredit = lastPeriodBalance.Sum(x => x.Credit) ?? 0 - lastPeriodBalance.Sum(x => x.Debit) ?? 0,
                    TotalDebit = 0,
                    Difference = lastPeriodBalance.Sum(x => x.Credit) ?? 0 - lastPeriodBalance.Sum(x => x.Debit) ?? 0
                };

                long totalRecords = suppliers.Count;
                                
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
                    LastPeriodTotals = new { Bakance = lastPeriodBalance, Total = lastPeriodTotals },
                    Pagination = paginationMetadata
                });
            }
        }
        #endregion

        #region Safes Subledger
        [HttpGet("GetSafesLedger")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Safes Subledger" }
        )]
        public async Task<IActionResult> GetSafesLedger(DateTime? fromDate, DateTime? toDate, long? accountID = 0, int pageNumber = 1, int pageSize = 10)
        {
            if (fromDate.HasValue && toDate.HasValue && toDate < fromDate)
                return BadRequest("Start date must be equal or greater than End date");

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            int startRow = ((pageNumber - 1) * pageSize) + 1;
            int endRow = pageNumber * pageSize;
            var dateToValue = fromDate.Value.AddDays(-1);
            TotalResult calcFirstPeriod;

            if (accountID == 0)
            {
                List<Save>? saves = await Unit_Of_Work.save_Repository.SelectQuery<Save>(x => x.IsDeleted != true).ToListAsync();

                if (saves == null || saves.Count == 0)
                    return NotFound("No saves accounts found.");

                var results = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountLedger @DateFrom, @DateTo, 0, @LinkFileID, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                     new SqlParameter("@LinkFileID", 5),
                    new SqlParameter("@StartRow", startRow),
                    new SqlParameter("@EndRow", endRow)
                ).ToListAsync();

                var resultsTotals = new
                {
                    TotalCredit = results.Sum(x => x.Credit) ?? 0,
                    TotalDebit = results.Sum(x => x.Debit) ?? 0,
                    Difference = results.Sum(x => x.Debit) ?? 0 - results.Sum(x => x.Credit) ?? 0
                };

                if (results == null || !results.Any())
                    return NotFound("No data found for the specified date range.");

                var firstPeriodBalance = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountLedger @DateFrom, @DateTo, 0, @LinkFileID, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", (object)dateToValue ?? DBNull.Value),
                     new SqlParameter("@LinkFileID", 5),
                    new SqlParameter("@StartRow", startRow),
                    new SqlParameter("@EndRow", endRow)
                ).ToListAsync();

                var firstPeriodTotals = new
                {
                    TotalCredit = 0,
                    TotalDebit = firstPeriodBalance.Sum(x => x.Debit) ?? 0 - firstPeriodBalance.Sum(x => x.Credit) ?? 0,
                    Difference = firstPeriodBalance.Sum(x => x.Debit) ?? 0 - firstPeriodBalance.Sum(x => x.Credit) ?? 0
                };

                List<AccountBalanceReport>? lastPeriodBalance = new();

                for (int i = 0; i < results.Count; i++)
                {
                    lastPeriodBalance.Add(new AccountBalanceReport()
                    {
                        ID = results[i].ID,
                        Name = results[i].Name,
                        Credit = 0,
                        Debit = (firstPeriodBalance[i].Debit - results[i].Credit) + results[i].Debit
                    });
                }

                var lastPeriodTotals = new
                {
                    TotalCredit = 0,
                    TotalDebit = lastPeriodBalance.Sum(x => x.Debit) ?? 0 - lastPeriodBalance.Sum(x => x.Credit) ?? 0,
                    Difference = lastPeriodBalance.Sum(x => x.Debit) ?? 0 - lastPeriodBalance.Sum(x => x.Credit) ?? 0
                };

                long totalRecords = saves.Count;

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
                    LastPeriodTotals = new { Bakance = lastPeriodBalance, Total = lastPeriodTotals },
                    Pagination = paginationMetadata
                });
            }
            else
            {
                AccountingTreeChart? account = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == accountID && x.IsDeleted != true);

                if (account == null)
                    return NotFound($"Account with ID: {accountID} not found.");

                List<Save> saves = await Unit_Of_Work.save_Repository.SelectQuery<Save>(x => x.IsDeleted != true && x.AccountNumberID == accountID).ToListAsync();

                if (saves == null || !saves.Any())
                    return NotFound("No saves found.");

                var results = await context.Set<AccountBalanceReport>().FromSqlRaw(
                     "EXEC dbo.GetAccountLedger @DateFrom, @DateTo, @AccountId, @LinkFileID, @StartRow, @EndRow",
                     new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                     new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                     new SqlParameter("@AccountId", accountID),
                     new SqlParameter("@LinkFileID", 5),
                     new SqlParameter("@StartRow", startRow),
                     new SqlParameter("@EndRow", endRow)
                 ).ToListAsync();

                if (results == null || !results.Any())
                    return NotFound("No data found for the specified date range.");

                var resultsTotals = new
                {
                    TotalCredit = results.Sum(x => x.Credit) ?? 0,
                    TotalDebit = results.Sum(x => x.Debit) ?? 0,
                    Difference = results.Sum(x => x.Debit) ?? 0 - results.Sum(x => x.Credit) ?? 0
                };

                var firstPeriodBalance = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountLedger @DateFrom, @DateTo, @AccountId, @LinkFileID, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", (object)dateToValue ?? DBNull.Value),
                     new SqlParameter("@AccountId", accountID),
                     new SqlParameter("@LinkFileID", 5),
                    new SqlParameter("@StartRow", startRow),
                    new SqlParameter("@EndRow", endRow)
                ).ToListAsync();

                var firstPeriodTotals = new
                {
                    TotalCredit = 0,
                    TotalDebit = firstPeriodBalance.Sum(x => x.Debit) ?? 0 - firstPeriodBalance.Sum(x => x.Credit) ?? 0,
                    Difference = firstPeriodBalance.Sum(x => x.Debit) ?? 0 - firstPeriodBalance.Sum(x => x.Credit) ?? 0
                };

                List<AccountBalanceReport>? lastPeriodBalance = new();

                for (int i = 0; i < results.Count; i++)
                {
                    lastPeriodBalance.Add(new AccountBalanceReport()
                    {
                        ID = results[i].ID,
                        Name = results[i].Name,
                        Credit = 0,
                        Debit = (firstPeriodBalance[i].Debit - results[i].Credit) + results[i].Debit
                    });
                }

                var lastPeriodTotals = new
                {
                    TotalCredit = 0,
                    TotalDebit = lastPeriodBalance.Sum(x => x.Debit) ?? 0 - lastPeriodBalance.Sum(x => x.Credit) ?? 0,
                    Difference = lastPeriodBalance.Sum(x => x.Debit) ?? 0 - lastPeriodBalance.Sum(x => x.Credit) ?? 0
                };

                long totalRecords = saves.Count;
                                
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
                    LastPeriodTotals = new { Bakance = lastPeriodBalance, Total = lastPeriodTotals },
                    Pagination = paginationMetadata
                });
            }
        }
        #endregion

        #region Banks Subledger
        [HttpGet("GetBanksLedger")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Banks Subledger" }
        )]
        public async Task<IActionResult> GetBanksLedger(DateTime? fromDate, DateTime? toDate, long? accountID = 0, int pageNumber = 1, int pageSize = 10)
        {
            if (fromDate.HasValue && toDate.HasValue && toDate < fromDate)
                return BadRequest("Start date must be equal or greater than End date");

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            int startRow = ((pageNumber - 1) * pageSize) + 1;
            int endRow = pageNumber * pageSize;
            var dateToValue = fromDate.Value.AddDays(-1);
            TotalResult calcFirstPeriod;

            if (accountID == 0)
            {
                List<Bank>? banks = await Unit_Of_Work.bank_Repository.SelectQuery<Bank>(x => x.IsDeleted != true).ToListAsync();

                if (banks == null || banks.Count == 0)
                    return NotFound("No banks accounts found.");

                var results = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountLedger @DateFrom, @DateTo, 0, @LinkFileID, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                    new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                     new SqlParameter("@LinkFileID", 6),
                    new SqlParameter("@StartRow", startRow),
                    new SqlParameter("@EndRow", endRow)
                ).ToListAsync();

                var resultsTotals = new
                {
                    TotalCredit = results.Sum(x => x.Credit) ?? 0,
                    TotalDebit = results.Sum(x => x.Debit) ?? 0,
                    Difference = results.Sum(x => x.Debit) ?? 0 - results.Sum(x => x.Credit) ?? 0
                };

                if (results == null || !results.Any())
                    return NotFound("No data found for the specified date range.");

                var firstPeriodBalance = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountLedger @DateFrom, @DateTo, 0, @LinkFileID, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", (object)dateToValue ?? DBNull.Value),
                     new SqlParameter("@LinkFileID", 6),
                    new SqlParameter("@StartRow", startRow),
                    new SqlParameter("@EndRow", endRow)
                ).ToListAsync();

                var firstPeriodTotals = new
                {
                    TotalCredit = 0,
                    TotalDebit = firstPeriodBalance.Sum(x => x.Debit) ?? 0 - firstPeriodBalance.Sum(x => x.Credit) ?? 0,
                    Difference = firstPeriodBalance.Sum(x => x.Debit) ?? 0 - firstPeriodBalance.Sum(x => x.Credit) ?? 0
                };

                List<AccountBalanceReport>? lastPeriodBalance = new();

                for (int i = 0; i < results.Count; i++)
                {
                    lastPeriodBalance.Add(new AccountBalanceReport()
                    {
                        ID = results[i].ID,
                        Name = results[i].Name,
                        Credit = 0,
                        Debit = (firstPeriodBalance[i].Debit - results[i].Credit) + results[i].Debit
                    });
                }

                var lastPeriodTotals = new
                {
                    TotalCredit = 0,
                    TotalDebit = lastPeriodBalance.Sum(x => x.Debit) ?? 0 - lastPeriodBalance.Sum(x => x.Credit) ?? 0,
                    Difference = lastPeriodBalance.Sum(x => x.Debit) ?? 0 - lastPeriodBalance.Sum(x => x.Credit) ?? 0
                };

                long totalRecords = banks.Count;

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
                    LastPeriodTotals = new { Bakance = lastPeriodBalance, Total = lastPeriodTotals },
                    Pagination = paginationMetadata
                });
            }
            else
            {
                AccountingTreeChart? account = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == accountID && x.IsDeleted != true);

                if (account == null)
                    return NotFound($"Account with ID: {accountID} not found.");

                List<Bank> banks = await Unit_Of_Work.bank_Repository.SelectQuery<Bank>(x => x.IsDeleted != true && x.AccountNumberID == accountID).ToListAsync();

                if (banks == null || !banks.Any())
                    return NotFound("No banks found.");

                var results = await context.Set<AccountBalanceReport>().FromSqlRaw(
                     "EXEC dbo.GetAccountLedger @DateFrom, @DateTo, @AccountId, @LinkFileID, @StartRow, @EndRow",
                     new SqlParameter("@DateFrom", fromDate ?? (object)DBNull.Value),
                     new SqlParameter("@DateTo", toDate ?? (object)DBNull.Value),
                     new SqlParameter("@AccountId", accountID),
                     new SqlParameter("@LinkFileID", 6),
                     new SqlParameter("@StartRow", startRow),
                     new SqlParameter("@EndRow", endRow)
                 ).ToListAsync();

                if (results == null || !results.Any())
                    return NotFound("No data found for the specified date range.");

                var resultsTotals = new
                {
                    TotalCredit = results.Sum(x => x.Credit) ?? 0,
                    TotalDebit = results.Sum(x => x.Debit) ?? 0,
                    Difference = results.Sum(x => x.Debit) ?? 0 - results.Sum(x => x.Credit) ?? 0
                };

                var firstPeriodBalance = await context.Set<AccountBalanceReport>().FromSqlRaw(
                    "EXEC dbo.GetAccountLedger @DateFrom, @DateTo, @AccountId, @LinkFileID, @StartRow, @EndRow",
                    new SqlParameter("@DateFrom", "1900-1-1"),
                    new SqlParameter("@DateTo", (object)dateToValue ?? DBNull.Value),
                     new SqlParameter("@AccountId", accountID),
                     new SqlParameter("@LinkFileID", 5),
                    new SqlParameter("@StartRow", startRow),
                    new SqlParameter("@EndRow", endRow)
                ).ToListAsync();

                var firstPeriodTotals = new
                {
                    TotalCredit = 0,
                    TotalDebit = firstPeriodBalance.Sum(x => x.Debit) ?? 0,
                    Difference = firstPeriodBalance.Sum(x => x.Debit) ?? 0 - firstPeriodBalance.Sum(x => x.Credit) ?? 0
                };

                List<AccountBalanceReport>? lastPeriodBalance = new();

                for (int i = 0; i < results.Count; i++)
                {
                    lastPeriodBalance.Add(new AccountBalanceReport()
                    {
                        ID = results[i].ID,
                        Name = results[i].Name,
                        Credit = 0,
                        Debit = (firstPeriodBalance[i].Debit - results[i].Credit) + results[i].Debit
                    });
                }

                var lastPeriodTotals = new
                {
                    TotalCredit = 0,
                    TotalDebit = lastPeriodBalance.Sum(x => x.Debit) ?? 0,
                    Difference = lastPeriodBalance.Sum(x => x.Debit) ?? 0 - lastPeriodBalance.Sum(x => x.Credit) ?? 0
                };

                long totalRecords = banks.Count;

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
                    LastPeriodTotals = new { Bakance = lastPeriodBalance, Total = lastPeriodTotals },
                    Pagination = paginationMetadata
                });
            }
        }
        #endregion

    }
}
