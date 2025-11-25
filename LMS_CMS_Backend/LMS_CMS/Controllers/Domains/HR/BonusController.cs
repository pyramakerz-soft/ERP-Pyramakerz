using AutoMapper;
using LMS_CMS_BL.DTO.HR;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.HR;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LMS_CMS_DAL.Models.Domains.BusModule;

namespace LMS_CMS_PL.Controllers.Domains.HR
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class BonusController : ControllerBase
    {

        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public BonusController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Bonus" }
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

            List<Bonus> bouns =await Unit_Of_Work.bouns_Repository.Select_All_With_IncludesById_Pagination<Bonus>(
                    sem => sem.IsDeleted != true,
                    query => query.Include(emp => emp.Employee),
                    query => query.Include(emp => emp.BonusType))
                   .Skip((pageNumber - 1) * pageSize)
                   .Take(pageSize)
                   .ToListAsync();

            if (bouns == null || bouns.Count == 0)
            {
                return NotFound();
            }

            List<BonusGetDTO> Dto = mapper.Map<List<BonusGetDTO>>(bouns);
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
          pages: new[] { "Bonus" }
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

            Bonus bouns = await Unit_Of_Work.bouns_Repository.FindByIncludesAsync(sem => sem.IsDeleted != true && sem.ID == id,
                 query => query.Include(emp => emp.Employee),
                 query => query.Include(emp => emp.BonusType));

            if (bouns == null)
            {
                return NotFound();
            }

            BonusGetDTO Dto = mapper.Map<BonusGetDTO>(bouns);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Bonus" }
         )]
        public async Task<IActionResult> Add(BonusAddDTO newBouns)
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
            if (newBouns == null)
            {
                return BadRequest("newBouns is empty");
            }

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.ID == newBouns.EmployeeID);
            if (employee == null)
            {
                return BadRequest("there is no employee with this id");
            }

            BonusType bounsType = Unit_Of_Work.bounsType_Repository.First_Or_Default(e => e.ID == newBouns.BonusTypeID);
            if (bounsType == null)
            {
                return BadRequest("there is no bonusType with this id");
            }

            Bonus bouns = mapper.Map<Bonus>(newBouns);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            bouns.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                bouns.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                bouns.InsertedByUserId = userId;
            }
            Unit_Of_Work.bouns_Repository.Add(bouns);
            Unit_Of_Work.SaveChanges();
            return Ok(newBouns);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           allowEdit: 1,
           pages: new[] { "Bonus" }
       )]
        public async Task<IActionResult> EditAsync(BonusAddDTO newBouns)
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

            if (newBouns == null)
            {
                return BadRequest("newBouns cannot be null");
            }
            if (newBouns.ID == null)
            {
                return BadRequest("id can not be null");
            }

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.ID == newBouns.EmployeeID);
            if (employee == null)
            {
                return BadRequest("there is no employee with this id");
            }

            BonusType bounsType = Unit_Of_Work.bounsType_Repository.First_Or_Default(e => e.ID == newBouns.BonusTypeID);
            if (bounsType == null)
            {
                return BadRequest("there is no bounsType with this id");
            }

            Bonus bouns = Unit_Of_Work.bouns_Repository.First_Or_Default(s => s.ID == newBouns.ID && s.IsDeleted != true);
            if (bouns == null)
            {
                return BadRequest("bouns not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Bonus", roleId, userId, bouns);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            switch (newBouns.BonusTypeID)
            {
                case 1:
                    newBouns.NumberOfBonusDays = 0;
                    newBouns.Amount = 0;
                    break;
                case 2:
                    newBouns.Hours = 0;
                    newBouns.Minutes = 0;
                    newBouns.Amount = 0;
                    break;
                case 3:
                    newBouns.NumberOfBonusDays = 0;
                    newBouns.Hours = 0;
                    newBouns.Minutes = 0;
                    break;
            }

            mapper.Map(newBouns, bouns);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            bouns.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                bouns.UpdatedByOctaId = userId;
                if (bouns.UpdatedByUserId != null)
                {
                    bouns.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                bouns.UpdatedByUserId = userId;
                if (bouns.UpdatedByOctaId != null)
                {
                    bouns.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.bouns_Repository.Update(bouns);
            Unit_Of_Work.SaveChanges();
            return Ok(newBouns);
        }

        ////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1,
          pages: new[] { "Bonus" }
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
            Bonus bouns = Unit_Of_Work.bouns_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (bouns == null)
            {
                return BadRequest("bouns not exist");
            }
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Bonus", roleId, userId, bouns);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            bouns.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            bouns.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                bouns.DeletedByOctaId = userId;
                if (bouns.DeletedByUserId != null)
                {
                    bouns.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                bouns.DeletedByUserId = userId;
                if (bouns.DeletedByOctaId != null)
                {
                    bouns.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.bouns_Repository.Update(bouns);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }

        [HttpPost("report")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Bonus Report" })]
        public async Task<IActionResult> GetBonusReport([FromBody] ReportRequestDto request) 
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

           
            var bonuses = await uow.bouns_Repository.Select_All_With_IncludesById<Bonus>(
                b => employeeIds.Contains(b.EmployeeID)
                     && b.Date >= request.DateFrom
                     && b.Date <= request.DateTo,
                q => q.Include(b => b.Employee).ThenInclude(e => e.Job).ThenInclude(j => j.JobCategory),
                q => q.Include(b => b.BonusType)
            );

            if (!bonuses.Any())
                return NotFound("No bonuses found");


            var bonusDtos = mapper.Map<List<BonusGetDTO>>(bonuses);

            foreach (var bonusDto in bonusDtos)
            {
                var bonus = bonuses.First(b => b.ID == bonusDto.ID);
                var employee = bonus.Employee;
                double salary = (double)(employee.MonthSalary ?? 0);
                if (salary == 0)
                {
                    bonus.Amount = 0;
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



                //string typeName = bonus.BounsType?.Name?.ToLower() ?? string.Empty;

                if (bonus.BonusTypeID == 1) // Hours
                {
                    bonusDto.Amount = Math.Round((decimal)((hourlyRate * bonus.Hours) + (minuteRate * bonus.Minutes)), 2);
                }
                else if (bonus.BonusTypeID == 2) // Days
                {
                    bonusDto.Amount = Math.Round((decimal)(dailyRate * bonus.NumberOfBonusDays), 2);
                }
                else if (bonus.BonusTypeID == 3) // Amount
                {
                    bonusDto.Amount = Math.Round((decimal)bonus.Amount, 2);
                }
                else
                {
                    bonusDto.Amount = Math.Round((decimal)bonus.Amount, 2); 
                }



            }

            var report = bonusDtos
                .GroupBy(b => new { b.EmployeeID, b.EmployeeEnName, b.EmployeeArName })
                .Select(g => new BonusReportDto
                {
                    EmployeeId = g.Key.EmployeeID,
                    EmployeeEnName = g.Key.EmployeeEnName,
                    EmployeeArName = g.Key.EmployeeArName,
                    TotalAmount = g.Sum(x => x.Amount),
                    Bonuses = g.OrderBy(x => x.Date).ToList()
                })
                .ToList();

            return Ok(report);
        }
    }
}
     