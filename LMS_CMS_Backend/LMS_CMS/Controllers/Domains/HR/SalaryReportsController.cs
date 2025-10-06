using AutoMapper;
using LMS_CMS_BL.DTO.HR;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.Administration;
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
    public class SalaryReportsController : ControllerBase
    {

        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public SalaryReportsController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////

        [HttpGet("GetEmployeeSalaryDetailed/{month}/{year}/{EmpId}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" }
         )]
        public async Task<IActionResult> GetEmployeeSalaryDetailed(int month , int year , long EmpId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            SalaryConfigration salaryConfigration = Unit_Of_Work.salaryConfigration_Repository
              .First_Or_Default(s => s.ID == 1);

            if (salaryConfigration == null)
            {
                return BadRequest("Salary configuration not found.");
            }

            int startDay = salaryConfigration.StartDay;
            TimeSpan OvertimeStartAfterMinutes = TimeSpan.FromMinutes(salaryConfigration.OvertimeStartAfterMinutes);
            DateOnly periodStart = new DateOnly();
            DateOnly periodEnd = new DateOnly();

            if (salaryConfigration.FromPreviousMonth == false)
            {
                periodStart = new DateOnly(year, month, startDay);
                periodEnd = periodStart.AddMonths(1).AddDays(-1);
            }
            else
            {
                periodStart = new DateOnly(year, month, startDay).AddMonths(-1);
                periodEnd = new DateOnly(year, month, startDay).AddDays(-1);
            }

            List<MonthlyAttendance> monthlyAttendances = await Unit_Of_Work.monthlyAttendance_Repository
                .Select_All_With_IncludesById<MonthlyAttendance>(
                    a => a.EmployeeId == EmpId && a.Day >= periodStart && a.Day <= periodEnd,
                    query => query.Include(b => b.DayStatus));

            monthlyAttendances= monthlyAttendances.OrderBy(b => b.Day).ToList();

            if (monthlyAttendances == null || monthlyAttendances.Count == 0)
            {
                return NotFound();
            }

            SalaryHistory AllSalaryHistory =await Unit_Of_Work.salaryHistory_Repository.FindByIncludesAsync(m => m.Month == month && m.Year == year && m.EmployeeId == EmpId && m.IsDeleted!= true,
                    query => query.Include(b => b.Employee));

            if (AllSalaryHistory == null )
            {
                return NotFound();
            }

            List<MonthlyAttendanceGetDTO> MonthlyAttendanceGetDTO = mapper.Map<List<MonthlyAttendanceGetDTO>>(monthlyAttendances);
            SalaryHistoryGetDTO SalaryHistoryGetDTO = mapper.Map<SalaryHistoryGetDTO>(AllSalaryHistory);

            return Ok(new { MonthlyAttendance = MonthlyAttendanceGetDTO, SalaryHistory = SalaryHistoryGetDTO , });
        }

        ////////////////////////////////

        [HttpGet("GetAttendance/{month}/{year}/{EmpId}")]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" }
        )]
        public async Task<IActionResult> GetAttendance(int month, int year, long EmpId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            SalaryConfigration salaryConfigration = Unit_Of_Work.salaryConfigration_Repository
              .First_Or_Default(s => s.ID == 1);

            if (salaryConfigration == null)
            {
                return BadRequest("Salary configuration not found.");
            }

            int startDay = salaryConfigration.StartDay;
            TimeSpan OvertimeStartAfterMinutes = TimeSpan.FromMinutes(salaryConfigration.OvertimeStartAfterMinutes);
            DateOnly periodStart = new DateOnly();
            DateOnly periodEnd = new DateOnly();

            if (salaryConfigration.FromPreviousMonth == false)
            {
                periodStart = new DateOnly(year, month, startDay);
                periodEnd = periodStart.AddMonths(1).AddDays(-1);
            }
            else
            {
                periodStart = new DateOnly(year, month, startDay).AddMonths(-1);
                periodEnd = new DateOnly(year, month, startDay).AddDays(-1);
            }

            List<MonthlyAttendance> monthlyAttendances = await Unit_Of_Work.monthlyAttendance_Repository
                .Select_All_With_IncludesById<MonthlyAttendance>(
                    a => a.EmployeeId == EmpId && a.Day >= periodStart && a.Day <= periodEnd,
                    query => query.Include(b => b.DayStatus));

            monthlyAttendances = monthlyAttendances.OrderBy(b => b.Day).ToList();
            if (monthlyAttendances == null || monthlyAttendances.Count == 0)
            {
                return NotFound();
            }

            List<MonthlyAttendanceGetDTO> MonthlyAttendanceGetDTO = mapper.Map<List<MonthlyAttendanceGetDTO>>(monthlyAttendances);
            return Ok(MonthlyAttendanceGetDTO);
        }

        ////////////////////////////////

        [HttpGet("GetSalarySummary/{month}/{year}/{EmpId}/{jobId}/{jobCatId}")]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" }
        )]
        public async Task<IActionResult> GetSalarySummary(int month, int year, long EmpId=0 , long jobId = 0 , long jobCatId = 0)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            SalaryConfigration salaryConfigration = Unit_Of_Work.salaryConfigration_Repository
              .First_Or_Default(s => s.ID == 1);

            if (salaryConfigration == null)
            {
                return BadRequest("Salary configuration not found.");
            }

            int startDay = salaryConfigration.StartDay;
            TimeSpan OvertimeStartAfterMinutes = TimeSpan.FromMinutes(salaryConfigration.OvertimeStartAfterMinutes);
            DateOnly periodStart = new DateOnly();
            DateOnly periodEnd = new DateOnly();

            if (salaryConfigration.FromPreviousMonth == false)
            {
                periodStart = new DateOnly(year, month, startDay);
                periodEnd = periodStart.AddMonths(1).AddDays(-1);
            }
            else
            {
                periodStart = new DateOnly(year, month, startDay).AddMonths(-1);
                periodEnd = new DateOnly(year, month, startDay).AddDays(-1);
            }

            // Get all employee 
            List<Employee> Allemployees = new List<Employee>();

            if (EmpId > 0)
            {
                var employee = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.ID == EmpId && e.IsDeleted != true);
                if (employee == null)
                {
                    return NotFound($"Employee with ID {EmpId} not found.");
                }
                Allemployees = new List<Employee> { employee };
            }
            else
            {
                if(jobId > 0)
                {
                    Allemployees = Unit_Of_Work.employee_Repository.FindBy(e => e.IsDeleted != true && e.JobID == jobId);
                }
                else if(jobCatId > 0)
                {
                    List<Job> jobs = Unit_Of_Work.job_Repository.FindBy(e => e.JobCategoryID== jobCatId);
                    List<long> jobids = jobs.Select(s=>s.ID).ToList();
                    Allemployees = Unit_Of_Work.employee_Repository.FindBy(e => e.IsDeleted != true && jobids.Contains((long)e.JobID));
                }
                else
                {
                    Allemployees = Unit_Of_Work.employee_Repository.FindBy(e => e.IsDeleted != true );

                }
            }

            List<long> employeeIds = Allemployees.Select(e=>e.ID).ToList();

            List<SalaryHistory> AllSalaryHistory = Unit_Of_Work.salaryHistory_Repository.FindBy(m => m.Month == month && m.Year == year && employeeIds.Contains(m.EmployeeId) );

            if (AllSalaryHistory == null || AllSalaryHistory.Count == 0)
            {
                return NotFound();
            }

            List<SalaryHistoryGetDTO> SalaryHistoryGetDTO = mapper.Map<List<SalaryHistoryGetDTO>>(AllSalaryHistory);

            return Ok(SalaryHistoryGetDTO);
        }

    }
}
