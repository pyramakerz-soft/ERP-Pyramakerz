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
          pages: new[] { "Conduct Level" }
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
          pages: new[] { "Conduct Level" }
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

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpGet("getRemainLeavRequestsByEmployeeId/{Empid}/{date}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Conduct Level" }
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

            Employee Employee = Unit_Of_Work.employee_Repository.First_Or_Default(sem => sem.IsDeleted != true);

            if (Employee == null )
            {
                return NotFound();
            }

            Employee_GetDTO EmployeeDTO = mapper.Map<Employee_GetDTO>(Employee);

            // Get current month and year
            var currentDate = date;
            var currentMonth = currentDate.Month;
            var currentYear = currentDate.Year;

            // Filter leave requests for the current month only
            List<LeaveRequest> leaveRequests = Unit_Of_Work.leaveRequest_Repository
                .FindBy(l => l.EmployeeID == Empid
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
            EmployeeDTO.MonthlyLeaveRequestUsed = allHours + (allMinutes / 60.0m);

            return Ok(EmployeeDTO);
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Conduct Level" }
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


            var currentDate = newRequest.Date;
            var currentMonth = currentDate.Month;
            var currentYear = currentDate.Year;

            // Filter leave requests for the current month only
            List<LeaveRequest> leaveRequests = Unit_Of_Work.leaveRequest_Repository
                .FindBy(l => l.EmployeeID == newRequest.EmployeeID
                          && l.IsDeleted != true
                          && l.Date.Month == currentMonth
                          && l.Date.Year == currentYear);

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
           pages: new[] { "Conduct Level" }
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

            var currentDate = newRequest.Date;
            var currentMonth = currentDate.Month;
            var currentYear = currentDate.Year;

            // Filter leave requests for the current month only
            List<LeaveRequest> leaveRequests = Unit_Of_Work.leaveRequest_Repository
                .FindBy(l => l.EmployeeID == newRequest.EmployeeID
                          && l.ID != newRequest.ID
                          && l.IsDeleted != true
                          && l.Date.Month == currentMonth
                          && l.Date.Year == currentYear);

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
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Conduct Level", roleId, userId, leaveRequest);
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
          pages: new[] { "Lesson Resources Types" }
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
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Conduct Level", roleId, userId, leaveRequest);
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
    }
}
