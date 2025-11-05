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

namespace LMS_CMS_PL.Controllers.Domains.HR
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class DeductionController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public DeductionController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }


        ////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Deduction" }
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

            int totalRecords = await Unit_Of_Work.bouns_Repository
               .CountAsync(f => f.IsDeleted != true);

            List<Deduction> deductions = await Unit_Of_Work.deduction_Repository.Select_All_With_IncludesById_Pagination<Deduction>(
                    sem => sem.IsDeleted != true,
                    query => query.Include(emp => emp.Employee),
                    query => query.Include(emp => emp.DeductionType))
                   .Skip((pageNumber - 1) * pageSize)
                   .Take(pageSize)
                   .ToListAsync();

            if (deductions == null || deductions.Count == 0)
            {
                return NotFound();
            }

            List<DeductionGetDTO> Dto = mapper.Map<List<DeductionGetDTO>>(deductions);

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
          pages: new[] { "Deduction" }
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

            Deduction bouns = await Unit_Of_Work.deduction_Repository.FindByIncludesAsync(sem => sem.IsDeleted != true && sem.ID == id,
                 query => query.Include(emp => emp.Employee),
                 query => query.Include(emp => emp.DeductionType));

            if (bouns == null)
            {
                return NotFound();
            }

            DeductionGetDTO Dto = mapper.Map<DeductionGetDTO>(bouns);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Deduction" }
         )]
        public async Task<IActionResult> Add(DeductionAddDTO newDeduction)
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
            if (newDeduction == null)
            {
                return BadRequest("newBouns is empty");
            }

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.ID == newDeduction.EmployeeID);
            if (employee == null)
            {
                return BadRequest("there is no employee with this id");
            }

            DeductionType deductionType = Unit_Of_Work.deductionType_Repository.First_Or_Default(e => e.ID == newDeduction.DeductionTypeID);
            if (deductionType == null)
            {
                return BadRequest("there is no deductionType with this id");
            }

            Deduction deduction = mapper.Map<Deduction>(newDeduction);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            deduction.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                deduction.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                deduction.InsertedByUserId = userId;
            }
            Unit_Of_Work.deduction_Repository.Add(deduction);
            Unit_Of_Work.SaveChanges();
            return Ok(newDeduction);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           allowEdit: 1,
           pages: new[] { "Deduction" }
       )]
        public async Task<IActionResult> EditAsync(DeductionAddDTO newDeduction)
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

            if (newDeduction == null)
            {
                return BadRequest("newDeduction cannot be null");
            }
            if (newDeduction.ID == null)
            {
                return BadRequest("id can not be null");
            }

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.ID == newDeduction.EmployeeID);
            if (employee == null)
            {
                return BadRequest("there is no employee with this id");
            }

            DeductionType deductionType = Unit_Of_Work.deductionType_Repository.First_Or_Default(e => e.ID == newDeduction.DeductionTypeID);
            if (deductionType == null)
            {
                return BadRequest("there is no deductionType with this id");
            }

            Deduction deduction = Unit_Of_Work.deduction_Repository.First_Or_Default(s => s.ID == newDeduction.ID && s.IsDeleted != true);
            if (deduction == null)
            {
                return BadRequest("deduction not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Deduction", roleId, userId, deduction);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(newDeduction, deduction);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            deduction.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                deduction.UpdatedByOctaId = userId;
                if (deduction.UpdatedByUserId != null)
                {
                    deduction.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                deduction.UpdatedByUserId = userId;
                if (deduction.UpdatedByOctaId != null)
                {
                    deduction.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.deduction_Repository.Update(deduction);
            Unit_Of_Work.SaveChanges();
            return Ok(newDeduction);
        }

        ////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1,
          pages: new[] { "Deduction" }
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
            Deduction deduction = Unit_Of_Work.deduction_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (deduction == null)
            {
                return BadRequest("deduction not exist");
            }
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Deduction", roleId, userId, deduction);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            deduction.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            deduction.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                deduction.DeletedByOctaId = userId;
                if (deduction.DeletedByUserId != null)
                {
                    deduction.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                deduction.DeletedByUserId = userId;
                if (deduction.DeletedByOctaId != null)
                {
                    deduction.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.deduction_Repository.Update(deduction);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
        [HttpPost("report")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Deduction Report" })]
        public async Task<IActionResult> GetDeductionReport([FromBody] ReportRequestDto request)
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
                    return NotFound("No employee found with this ID");
            }

            if (request.JobId.HasValue && request.JobId.Value > 0)
            {
                var job = uow.job_Repository
                    .First_Or_Default(j => j.ID == request.JobId.Value && j.IsDeleted != true);

                if (job == null)
                    return NotFound("No job found with this ID");
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


            var Deductions = await uow.deduction_Repository.Select_All_With_IncludesById<Deduction>(
                b => employeeIds.Contains(b.EmployeeID)
                     && b.Date >= request.DateFrom
                     && b.Date <= request.DateTo,
                q => q.Include(b => b.Employee).ThenInclude(e => e.Job).ThenInclude(j => j.JobCategory),
                q => q.Include(b => b.DeductionType)
            );

            if (!Deductions.Any())
                return NotFound("No deductions found");


            var DeductionDtos = mapper.Map<List<DeductionGetDTO>>(Deductions);

            foreach (var DeductionDto in DeductionDtos)
            {
                var deduction = Deductions.First(d => d.ID == DeductionDto.ID);
                var employee = deduction.Employee;
                double salary = (double)(employee.MonthSalary ?? 0);
                if (salary == 0)
                {
                    deduction.Amount = 0;
                    continue;
                }

                TimeSpan attendanceTime = TimeSpan.Zero;
                TimeSpan departureTime = TimeSpan.Zero;
                double totalDayHours = 8; // default

                if (!string.IsNullOrEmpty(employee.AttendanceTime) && !string.IsNullOrEmpty(employee.DepartureTime))
                {
                    attendanceTime = DateTime.Parse(employee.AttendanceTime).TimeOfDay;
                    departureTime = DateTime.Parse(employee.DepartureTime).TimeOfDay;

                    if (departureTime < attendanceTime)
                    {
                        totalDayHours = (TimeSpan.FromHours(24) - attendanceTime + departureTime).TotalHours;
                    }
                    else
                    {
                        totalDayHours = (departureTime - attendanceTime).TotalHours;
                    }
                }

                double dailyRate = salary / 30;
                double hourlyRate = dailyRate / totalDayHours;
                double minuteRate = hourlyRate / 60;


                if (deduction.DeductionTypeID == 1) // Hours
                {
                    DeductionDto.Amount = Math.Round((decimal)((hourlyRate * deduction.Hours) + (minuteRate * deduction.Minutes)), 2);
                }
                else if (deduction.DeductionTypeID == 2) // Days
                {
                    DeductionDto.Amount = Math.Round((decimal)(dailyRate * deduction.NumberOfDeductionDays), 2);
                }
                else if (deduction.DeductionTypeID == 3) // Amount
                {
                    DeductionDto.Amount = Math.Round((decimal)deduction.Amount, 2);
                }
                else
                {
                    DeductionDto.Amount = Math.Round((decimal)deduction.Amount, 2); 
                }


            }

            var report = DeductionDtos
                .GroupBy(b => new { b.EmployeeID, b.EmployeeEnName, b.EmployeeArName })
                .Select(g => new DeductionReportDto
                {
                    EmployeeId = g.Key.EmployeeID,
                    EmployeeEnName = g.Key.EmployeeEnName,
                    EmployeeArName = g.Key.EmployeeArName,
                    TotalAmount = g.Sum(x => x.Amount),
                    Deductions = g.ToList()
                })
                .ToList();

            return Ok(report);
        }
    }
}
