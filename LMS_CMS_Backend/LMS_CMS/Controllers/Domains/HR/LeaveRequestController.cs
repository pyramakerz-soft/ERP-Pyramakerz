using AutoMapper;
using LMS_CMS_BL.DTO.HR;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.HR;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Drawing.Printing;
using static System.Runtime.InteropServices.JavaScript.JSType;
using LMS_CMS_BL.DTO;
using System.Net;

namespace LMS_CMS_PL.Controllers.Domains.HR
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class LeaveRequestController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public LeaveRequestController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }


        ////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Leave Request" }
         )]
        public async Task<IActionResult> GetAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
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

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            int totalRecords = await Unit_Of_Work.leaveRequest_Repository
               .CountAsync(f => f.IsDeleted != true);


            List<LeaveRequest> leaveRequests = await Unit_Of_Work.leaveRequest_Repository.Select_All_With_IncludesById_Pagination<LeaveRequest>(
                    sem => sem.IsDeleted != true,
                    query => query.Include(emp => emp.Employee))
                   .Skip((pageNumber - 1) * pageSize)
                   .Take(pageSize)
                   .ToListAsync();

            if (leaveRequests == null || leaveRequests.Count == 0)
            {
                return NotFound();
            }

            List<leaveRequestsGetDTO> Dto = mapper.Map<List<leaveRequestsGetDTO>>(leaveRequests);

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = Dto, Pagination = paginationMetadata });
        }

        ////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Leave Request" }
        )]
        public async Task<IActionResult> GetById(long id)
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

            LeaveRequest leaveRequest = await Unit_Of_Work.leaveRequest_Repository.FindByIncludesAsync(sem => sem.IsDeleted != true && sem.ID == id,
                 query => query.Include(emp => emp.Employee));

            if (leaveRequest == null)
            {
                return NotFound();
            }

            leaveRequestsGetDTO Dto = mapper.Map<leaveRequestsGetDTO>(leaveRequest);

            // Get current month and year
            var currentDate = DateTime.UtcNow;
            var currentMonth = currentDate.Month;
            var currentYear = currentDate.Year;

            // Filter leave requests for the current month only
            List<LeaveRequest> leaveRequests = Unit_Of_Work.leaveRequest_Repository
                .FindBy(l => l.EmployeeID == Dto.EmployeeID
                          && l.IsDeleted != true
                          && l.Date.Month == currentMonth
                          && l.Date.Year == currentYear);

            // Sum up hours and minutes
            var allHours = leaveRequests.Sum(l => l.Hours);
            var allMinutes = leaveRequests.Sum(l => l.Minutes);

            // Convert total minutes into hours and remaining minutes
            allHours += allMinutes / 60;
            allMinutes = allMinutes % 60;

            // Convert hours and minutes to decimal (e.g., 4.5 for 4 hours 30 minutes)
            Dto.Used = allHours + (allMinutes / 60.0m);

            Dto.Remains = (decimal)(Dto.MonthlyLeaveRequestBalance - Dto.Used);

            return Ok(Dto);
        }

        ////////////////////////////////

        private DateOnly SafeDateOnly(int year, int month, int day)
        {
            if (day <= 0)
            {
                // Go back one month
                if (month == 1)
                {
                    year -= 1;
                    month = 12;
                }
                else
                {
                    month -= 1;
                }

                day = DateTime.DaysInMonth(year, month); // last day of prev month
            }

            int daysInMonth = DateTime.DaysInMonth(year, month);
            int safeDay = Math.Min(day, daysInMonth);
            return new DateOnly(year, month, safeDay);
        }

        [HttpGet("getRemainLeavRequestsByEmployeeId/{Empid}/{date}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Leave Request" }
        )]
        public async Task<IActionResult> getRemainLeavRequestsByEmployeeId(long Empid ,DateOnly date)
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

            Employee Employee = Unit_Of_Work.employee_Repository.First_Or_Default(sem => sem.IsDeleted != true && sem.ID == Empid);

            if (Employee == null )
            {
                return NotFound();
            }

            if(Employee.MonthlyLeaveRequestBalance == null || Employee.MonthlyLeaveRequestBalance == 0)
            {
                return BadRequest("Monthly leave request for this employee is required.");
            }

            Employee_GetDTO EmployeeDTO = mapper.Map<Employee_GetDTO>(Employee);


            SalaryConfigration salaryConfigration = Unit_Of_Work.salaryConfigration_Repository
             .First_Or_Default(s => s.ID == 1);

            if (salaryConfigration == null)
            {
                return BadRequest("Salary configuration not found.");
            }

            var currentDate = date;
            var startDay = salaryConfigration.StartDay;
            var fromPrevious = salaryConfigration.FromPreviousMonth;

            DateOnly periodStart;
            DateOnly periodEnd;

            // Case 1: Salary cycle starts from current month
            if (!fromPrevious)
            {
                if (currentDate.Day >= startDay)
                {
                    periodStart = SafeDateOnly(currentDate.Year, currentDate.Month, startDay);
                    var endMonth = currentDate.Month == 12 ? 1 : currentDate.Month + 1;
                    var endYear = currentDate.Month == 12 ? currentDate.Year + 1 : currentDate.Year;
                    periodEnd = SafeDateOnly(endYear, endMonth, startDay - 1);
                }
                else
                {
                    var prevMonth = currentDate.Month == 1 ? 12 : currentDate.Month - 1;
                    var prevYear = currentDate.Month == 1 ? currentDate.Year - 1 : currentDate.Year;
                    periodStart = SafeDateOnly(prevYear, prevMonth, startDay);
                    periodEnd = SafeDateOnly(currentDate.Year, currentDate.Month, startDay - 1);
                }
            }
            else
            {
                if (currentDate.Day >= startDay)
                {
                    periodStart = SafeDateOnly(currentDate.Year, currentDate.Month, startDay);
                    var endMonth = currentDate.Month == 12 ? 1 : currentDate.Month + 1;
                    var endYear = currentDate.Month == 12 ? currentDate.Year + 1 : currentDate.Year;
                    periodEnd = SafeDateOnly(endYear, endMonth, startDay - 1);
                }
                else
                {
                    var prevMonth = currentDate.Month == 1 ? 12 : currentDate.Month - 1;
                    var prevYear = currentDate.Month == 1 ? currentDate.Year - 1 : currentDate.Year;
                    periodStart = SafeDateOnly(prevYear, prevMonth, startDay);
                    periodEnd = SafeDateOnly(currentDate.Year, currentDate.Month, startDay - 1);
                }
            }

            List<LeaveRequest> leaveRequests = Unit_Of_Work.leaveRequest_Repository
                 .FindBy(l => l.EmployeeID == Empid
                           && l.IsDeleted != true
                           && l.Date >= periodStart
                           && l.Date <= periodEnd);

            // Sum up hours and minutes
            var allHours = leaveRequests.Sum(l => l.Hours);
            var allMinutes = leaveRequests.Sum(l => l.Minutes);

            // Convert total minutes into hours and remaining minutes
            allHours += allMinutes / 60;
            allMinutes = allMinutes % 60;

            // Convert hours and minutes to decimal (e.g., 4.5 for 4 hours 30 minutes)
            EmployeeDTO.MonthlyLeaveRequestUsed = allHours + (allMinutes / 60.0m);

            return Ok(EmployeeDTO);
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Leave Request" }
         )]
        public async Task<IActionResult> Add(leaveRequestsAddDTO newRequest)
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
            if (newRequest == null)
            {
                return BadRequest("newRequest is empty");
            }

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.ID == newRequest.EmployeeID);
            if (employee == null)
            {
                return BadRequest("there is no employee with this id"); 
            }


            SalaryConfigration salaryConfigration = Unit_Of_Work.salaryConfigration_Repository
               .First_Or_Default(s => s.ID == 1);

            if (salaryConfigration == null)
            {
                return BadRequest("Salary configuration not found.");
            }

            var currentDate = newRequest.Date;
            var startDay = salaryConfigration.StartDay;
            var fromPrevious = salaryConfigration.FromPreviousMonth;

            DateOnly periodStart;
            DateOnly periodEnd;

            // Case 1: Salary cycle starts from current month
            if (!fromPrevious)
            {
                if (currentDate.Day >= startDay)
                {
                    periodStart = SafeDateOnly(currentDate.Year, currentDate.Month, startDay);
                    var endMonth = currentDate.Month == 12 ? 1 : currentDate.Month + 1;
                    var endYear = currentDate.Month == 12 ? currentDate.Year + 1 : currentDate.Year;
                    periodEnd = SafeDateOnly(endYear, endMonth, startDay - 1);
                }
                else
                {
                    var prevMonth = currentDate.Month == 1 ? 12 : currentDate.Month - 1;
                    var prevYear = currentDate.Month == 1 ? currentDate.Year - 1 : currentDate.Year;
                    periodStart = SafeDateOnly(prevYear, prevMonth, startDay);
                    periodEnd = SafeDateOnly(currentDate.Year, currentDate.Month, startDay - 1);
                }
            }
            else
            {
                if (currentDate.Day >= startDay)
                {
                    periodStart = SafeDateOnly(currentDate.Year, currentDate.Month, startDay);
                    var endMonth = currentDate.Month == 12 ? 1 : currentDate.Month + 1;
                    var endYear = currentDate.Month == 12 ? currentDate.Year + 1 : currentDate.Year;
                    periodEnd = SafeDateOnly(endYear, endMonth, startDay - 1);
                }
                else
                {
                    var prevMonth = currentDate.Month == 1 ? 12 : currentDate.Month - 1;
                    var prevYear = currentDate.Month == 1 ? currentDate.Year - 1 : currentDate.Year;
                    periodStart = SafeDateOnly(prevYear, prevMonth, startDay);
                    periodEnd = SafeDateOnly(currentDate.Year, currentDate.Month, startDay - 1);
                }
            }

            List<LeaveRequest> leaveRequests = Unit_Of_Work.leaveRequest_Repository
                 .FindBy(l => l.EmployeeID == newRequest.EmployeeID
                           && l.IsDeleted != true
                           && l.Date >= periodStart
                           && l.Date <= periodEnd);

            var allHours = leaveRequests.Sum(l => l.Hours);
            var allMinutes = leaveRequests.Sum(l => l.Minutes);

            // Convert total minutes to hours and remaining minutes
            allHours += allMinutes / 60;
            allMinutes = allMinutes % 60;

            // Convert hours and minutes to decimal (e.g., 4.10 for 4 hours 10 minutes)
            var Used = allHours + (allMinutes / 60.0m);
            var newHM = newRequest.Hours + (newRequest.Minutes / 60.0m);

            if (Used + newHM > employee.MonthlyLeaveRequestBalance)
            {
                return BadRequest("You Can not exceed MonthlyLeaveRequestBalance");
            }

            LeaveRequest leaveRequest = mapper.Map<LeaveRequest>(newRequest);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            leaveRequest.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                leaveRequest.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                leaveRequest.InsertedByUserId = userId;
            }
            Unit_Of_Work.leaveRequest_Repository.Add(leaveRequest);
            Unit_Of_Work.SaveChanges();
            return Ok(newRequest);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           allowEdit: 1,
           pages: new[] { "Leave Request" }
       )]
        public async Task<IActionResult> EditAsync(leaveRequestsAddDTO newRequest)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (newRequest == null)
            {
                return BadRequest("newDeduction cannot be null");
            }
            if (newRequest.ID == null)
            {
                return BadRequest("id can not be null");
            }

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.ID == newRequest.EmployeeID);
            if (employee == null)
            {
                return BadRequest("there is no employee with this id");
            }

            LeaveRequest leaveRequest = Unit_Of_Work.leaveRequest_Repository.First_Or_Default(s => s.ID == newRequest.ID && s.IsDeleted != true);
            if (leaveRequest == null)
            {
                return BadRequest("leaveRequest not exist");
            }

            SalaryConfigration salaryConfigration = Unit_Of_Work.salaryConfigration_Repository
        .First_Or_Default(s => s.ID == 1);

            if (salaryConfigration == null)
            {
                return BadRequest("Salary configuration not found.");
            }

            var currentDate = newRequest.Date;
            var startDay = salaryConfigration.StartDay;
            var fromPrevious = salaryConfigration.FromPreviousMonth;

            DateOnly periodStart;
            DateOnly periodEnd;

            // Case 1: Salary cycle starts from current month
            if (!fromPrevious)
            {
                if (currentDate.Day >= startDay)
                {
                    periodStart = SafeDateOnly(currentDate.Year, currentDate.Month, startDay);
                    var endMonth = currentDate.Month == 12 ? 1 : currentDate.Month + 1;
                    var endYear = currentDate.Month == 12 ? currentDate.Year + 1 : currentDate.Year;
                    periodEnd = SafeDateOnly(endYear, endMonth, startDay - 1);
                }
                else
                {
                    var prevMonth = currentDate.Month == 1 ? 12 : currentDate.Month - 1;
                    var prevYear = currentDate.Month == 1 ? currentDate.Year - 1 : currentDate.Year;
                    periodStart = SafeDateOnly(prevYear, prevMonth, startDay);
                    periodEnd = SafeDateOnly(currentDate.Year, currentDate.Month, startDay - 1);
                }
            }
            else
            {
                if (currentDate.Day >= startDay)
                {
                    periodStart = SafeDateOnly(currentDate.Year, currentDate.Month, startDay);
                    var endMonth = currentDate.Month == 12 ? 1 : currentDate.Month + 1;
                    var endYear = currentDate.Month == 12 ? currentDate.Year + 1 : currentDate.Year;
                    periodEnd = SafeDateOnly(endYear, endMonth, startDay - 1);
                }
                else
                {
                    var prevMonth = currentDate.Month == 1 ? 12 : currentDate.Month - 1;
                    var prevYear = currentDate.Month == 1 ? currentDate.Year - 1 : currentDate.Year;
                    periodStart = SafeDateOnly(prevYear, prevMonth, startDay);
                    periodEnd = SafeDateOnly(currentDate.Year, currentDate.Month, startDay - 1);
                }
            }

            List<LeaveRequest> leaveRequests = Unit_Of_Work.leaveRequest_Repository
               .FindBy(l => l.EmployeeID == newRequest.EmployeeID
                         && l.ID != newRequest.ID
                         && l.IsDeleted != true
                         && l.Date >= periodStart
                         && l.Date <= periodEnd);

            var allHours = leaveRequests.Sum(l => l.Hours);
            var allMinutes = leaveRequests.Sum(l => l.Minutes);

            // Convert total minutes to hours and remaining minutes
            allHours += allMinutes / 60;
            allMinutes = allMinutes % 60;

            // Convert hours and minutes to decimal (e.g., 4.10 for 4 hours 10 minutes)
            var Used = allHours + (allMinutes / 60.0m);
            var newHM = newRequest.Hours + (newRequest.Minutes / 60.0m);

            if (Used + newHM > employee.MonthlyLeaveRequestBalance)
            {
                return BadRequest("You Can not exceed MonthlyLeaveRequestBalance");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Leave Request", roleId, userId, leaveRequest);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(newRequest, leaveRequest);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            leaveRequest.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                leaveRequest.UpdatedByOctaId = userId;
                if (leaveRequest.UpdatedByUserId != null)
                {
                    leaveRequest.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                leaveRequest.UpdatedByUserId = userId;
                if (leaveRequest.UpdatedByOctaId != null)
                {
                    leaveRequest.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.leaveRequest_Repository.Update(leaveRequest);
            Unit_Of_Work.SaveChanges();
            return Ok(newRequest);
        }

        ////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1,
          pages: new[] { "Leave Request" }
        )]
        public IActionResult Delete(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (id == null)
            {
                return BadRequest("id cannot be null");
            }
            LeaveRequest leaveRequest = Unit_Of_Work.leaveRequest_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (leaveRequest == null)
            {
                return BadRequest("leaveRequest not exist");
            }
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Leave Request", roleId, userId, leaveRequest);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            leaveRequest.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            leaveRequest.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                leaveRequest.DeletedByOctaId = userId;
                if (leaveRequest.DeletedByUserId != null)
                {
                    leaveRequest.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                leaveRequest.DeletedByUserId = userId;
                if (leaveRequest.DeletedByOctaId != null)
                {
                    leaveRequest.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.leaveRequest_Repository.Update(leaveRequest);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }


        [HttpPost("report")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Leave Request Report" })]
        public async Task<IActionResult> GetLeaveRequestReport([FromBody] ReportRequestDto request)
        {
            if (request == null)
                return BadRequest("Invalid request.");
            if (request.DateFrom == default || request.DateTo == default)
                return BadRequest("DateFrom and DateTo are required.");

            UOW uow = _dbContextFactory.CreateOneDbContext(HttpContext);
            var filterService = new EmployeeFilterService(uow);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            if (request.EmployeeId.HasValue && request.EmployeeId.Value > 0)
            {
                var employee = uow.employee_Repository
                    .First_Or_Default(e => e.ID == request.EmployeeId.Value && e.IsDeleted != true);

                if (employee == null)
                    return NotFound("No employee found with this ID.");

            }

            if (request.JobId.HasValue && request.JobId.Value > 0)
            {
                var job = uow.job_Repository
                    .First_Or_Default(j => j.ID == request.JobId.Value && j.IsDeleted != true);

                if (job == null)
                    return NotFound("No job found with this ID.");
            }

            if (request.CategoryId.HasValue && request.CategoryId.Value > 0)
            {
                var category = uow.jobCategory_Repository
                    .First_Or_Default(c => c.ID == request.CategoryId.Value && c.IsDeleted != true);

                if (category == null)
                    return NotFound("No category found with this ID");
            }

            if (request.EmployeeId > 0 && request.JobId > 0)
            {
                var employeeJob = await uow.employee_Repository.FindByIncludesAsync(
                    e => e.ID == request.EmployeeId && e.JobID == request.JobId,
                    q => q.Include(e => e.Job)
                );

                if (employeeJob == null)
                    return BadRequest("The employee does not belong to the given job.");
            }

            if (request.EmployeeId > 0 && request.CategoryId > 0)
            {
                var employeeCategory = await uow.employee_Repository.FindByIncludesAsync(
                    e => e.ID == request.EmployeeId && e.Job.JobCategoryID == request.CategoryId,
                    q => q.Include(e => e.Job)
                );

                if (employeeCategory == null)
                    return BadRequest("The employee’s job does not belong to the given category.");
            }

            if (request.JobId > 0 && request.CategoryId > 0)
            {
                var jobCategory = uow.job_Repository.First_Or_Default(
                    j => j.ID == request.JobId && j.JobCategoryID == request.CategoryId
                );

                if (jobCategory == null)
                    return BadRequest("The job does not belong to the given category.");
            }

            
            var employees = await filterService.GetEmployees(
                request.CategoryId,
                request.JobId,
                request.EmployeeId
            );

            if (!employees.Any())
                return NotFound("No employees found for the given filters.");

            var employeeIds = employees.Select(e => e.ID).ToList();

            var leaveRequests = await uow.leaveRequest_Repository.Select_All_With_IncludesById<LeaveRequest>(
                b => employeeIds.Contains(b.EmployeeID)
                     && b.Date >= request.DateFrom
                     && b.Date <= request.DateTo,
                q => q.Include(b => b.Employee).ThenInclude(e => e.Job).ThenInclude(j => j.JobCategory)
            );

            if (!leaveRequests.Any())
                return NotFound("No leaveRequests found.");

            var leaveRequestDtos = mapper.Map<List<leaveRequestsGetDTO>>(leaveRequests);
            foreach (var dto in leaveRequestDtos)
            {
                var sameMonthRequests = leaveRequests
                    .Where(l => l.EmployeeID == dto.EmployeeID
                             && l.Date.Month == dto.Date.Month
                             && l.Date.Year == dto.Date.Year)
                    .ToList();

                var allHours = sameMonthRequests.Sum(l => l.Hours);
                var allMinutes = sameMonthRequests.Sum(l => l.Minutes);

                
                allHours += allMinutes / 60;
                allMinutes = allMinutes % 60;

                dto.Used = allHours + (allMinutes / 60.0m);
            }

            var report = leaveRequestDtos
                .GroupBy(b => new { b.EmployeeID, b.EmployeeEnName, b.EmployeeArName })
                .Select(g => new LeaveRequestReportDto
                {
                    EmployeeId = g.Key.EmployeeID,
                    EmployeeEnName = g.Key.EmployeeEnName,
                    EmployeeArName = g.Key.EmployeeArName,
                    TotalAmount = g.Sum(x => x.Used),
                    LeaveRequests = g.ToList()
                })
                .ToList();

            return Ok(report);
        }

    }
}
