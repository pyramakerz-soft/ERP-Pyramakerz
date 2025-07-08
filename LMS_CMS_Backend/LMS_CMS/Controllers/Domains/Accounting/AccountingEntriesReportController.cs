using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.AccountingModule.Reports;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Accounting
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    //[Authorize]
    public class AccountingEntriesReportController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public AccountingEntriesReportController(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }

        #region Accounting Entries
        [HttpGet("AccountingEntries")]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "" }
        //)]
        public async Task<IActionResult> GetAccountingEntriesAsync(DateTime fromDate, DateTime toDate)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var context = Unit_Of_Work.DbContext;

            var result = await context.Set<AccountingEntriesReport>().FromSqlRaw(@"
                SELECT * FROM dbo.FilterEntries(@DateFrom, @DateTo)
            ",
            new SqlParameter("@DateFrom", fromDate),
            new SqlParameter("@DateTo", toDate)
            ).ToListAsync();

            if (result == null || !result.Any())
            {
                return NotFound("No accounting entries found for the specified date range.");
            }

            return Ok(result);
        }
        #endregion
    }
}
