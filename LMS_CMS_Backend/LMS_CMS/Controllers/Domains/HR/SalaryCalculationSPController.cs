using AutoMapper;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.HR;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.HR
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class SalaryCalculationSPController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public SalaryCalculationSPController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" }
         )]
        public async Task<IActionResult> AddAllMonthlyAttendence(int month, int year, long employeeId = 0)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var _dbContext = Unit_Of_Work.DbContext; 

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (employeeId == 0)
            {
                await _dbContext.Database.ExecuteSqlRawAsync(
                    "EXEC dbo.AddAllMonthlyAttendance @Month = {0}, @Year = {1}, @EmployeeId = 0",
                    month, year);
            }
            else
            {
                await _dbContext.Database.ExecuteSqlRawAsync(
                    "EXEC dbo.AddAllMonthlyAttendance @Month = {0}, @Year = {1}, @EmployeeId = {2}",
                    month, year, employeeId);
            }

            return Ok();
        }
    }
}
