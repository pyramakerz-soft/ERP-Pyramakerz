using AutoMapper;
using LMS_CMS_BL.DTO.HR;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
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
    public class VacationEmployeeController : ControllerBase
    {

        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public VacationEmployeeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" }
          //,
          //pages: new[] { "Conduct Level" }
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

            int totalRecords = await Unit_Of_Work.vacationEmployee_Repository
               .CountAsync(f => f.IsDeleted != true);

            List<VacationEmployee> vacationEmployees =await Unit_Of_Work.vacationEmployee_Repository.Select_All_With_IncludesById_Pagination<VacationEmployee>(t => t.IsDeleted != true,
                     query => query.Include(emp => emp.Employee),
                     query => query.Include(emp => emp.VacationTypes))
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();


            if (vacationEmployees == null || vacationEmployees.Count == 0)
            {
                return NotFound();
            }

            List<VacationEmployeeGetDTO> Dto = mapper.Map<List<VacationEmployeeGetDTO>>(vacationEmployees);

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
          allowedTypes: new[] { "octa", "employee" }
          //,
          //pages: new[] { "Conduct Level" }
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

            VacationEmployee vacationEmployee =await Unit_Of_Work.vacationEmployee_Repository.FindByIncludesAsync(sem => sem.IsDeleted != true && sem.ID == id,
                     query => query.Include(emp => emp.Employee),
                     query => query.Include(emp => emp.VacationTypes));

            if (vacationEmployee == null)
            {
                return NotFound();
            }

            VacationEmployeeGetDTO Dto = mapper.Map<VacationEmployeeGetDTO>(vacationEmployee);

            return Ok(Dto);
        }

        ////////////////////////////////
        
        [HttpGet("GetBalanceAndUsedVacationEmployee/{EmployeeId}/{VacationId}/{date}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" }

        )]
        public async Task<IActionResult> GetBalanceAndUsedVacationEmployee(long EmployeeId,long VacationId , DateOnly date)
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

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.ID == EmployeeId && e.IsDeleted != true);
            if (employee == null)
            {
                return BadRequest("there is no employee with this id");
            }

            VacationTypes type = Unit_Of_Work.vacationTypes_Repository.First_Or_Default(e => e.ID == VacationId && e.IsDeleted != true);
            if (type == null)
            {
                return BadRequest("there is no type with this id");
            }

            AnnualVacationEmployee annualvacationEmployee =await Unit_Of_Work.annualVacationEmployee_Repository.FindByIncludesAsync(
                     a=>a.EmployeeID == EmployeeId && a. VacationTypesID==VacationId && a.IsDeleted == true,
                     query => query.Include(emp => emp.Employee),
                     query => query.Include(emp => emp.VacationTypes));

            if(annualvacationEmployee == null)
            {
                return BadRequest("this employee not assign for this vacation type");
            }

            AnnualVacationEmployeeGetDTO dto = mapper.Map<AnnualVacationEmployeeGetDTO>(annualvacationEmployee);

            // find current cycle based on hire date
            DateOnly hireDate = employee.HireDate.Value;
            int yearDiff = date.Year - hireDate.Year;

            // determine current cycle start
            DateOnly cycleStart = new DateOnly(hireDate.Year + yearDiff, hireDate.Month, hireDate.Day);

            // if date is before this year’s anniversary, move cycle back one year
            if (date < cycleStart)
            {
                cycleStart = cycleStart.AddYears(-1);
            }

            DateOnly cycleEnd = cycleStart.AddYears(1).AddDays(-1);

            List<VacationEmployee> vacationEmployee = Unit_Of_Work.vacationEmployee_Repository.FindBy(
                sem => sem.IsDeleted != true &&
                        sem.EmployeeID == EmployeeId &&
                        sem.VacationTypesID == VacationId &&
                        sem.DateFrom <= cycleEnd &&                // vacation starts before or on cycle end
                        (sem.DateTo ?? sem.DateFrom) >= cycleStart // vacation ends after or on cycle start
            );

            foreach (var vac in vacationEmployee)
            {
                var vacStart = vac.DateFrom;
                var vacEnd = vac.DateTo ?? vac.DateFrom;

                // Clip vacation range to cycle boundaries
                var effectiveStart = vacStart < cycleStart ? cycleStart : vacStart;
                var effectiveEnd = vacEnd > cycleEnd ? cycleEnd : vacEnd;

                if (effectiveStart > effectiveEnd)
                    continue; // no overlap with this cycle

                if (vac.HalfDay && effectiveStart == effectiveEnd)
                {
                    dto.used += 0.5;
                }
                else
                {
                    dto.used += (effectiveEnd.DayNumber - effectiveStart.DayNumber) + 1; // inclusive
                }
            }

            return Ok(dto);
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }
         )]
        public async Task<IActionResult> Add(VacationEmployeeAddDTO newVacation)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            if (newVacation == null)
                return BadRequest("vacation is empty");

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.ID == newVacation.EmployeeID && e.IsDeleted != true);
            if (employee == null)
                return BadRequest("there is no employee with this id");

            VacationTypes type = Unit_Of_Work.vacationTypes_Repository.First_Or_Default(e => e.ID == newVacation.VacationTypesID && e.IsDeleted != true);
            if (type == null)
                return BadRequest("there is no type with this id");

            // Check if employee is assigned to this vacation type
            AnnualVacationEmployee annualvacationEmployee = await Unit_Of_Work.annualVacationEmployee_Repository.FindByIncludesAsync(
                a => a.EmployeeID == newVacation.EmployeeID && a.VacationTypesID == newVacation.VacationTypesID && a.IsDeleted != true,
                query => query.Include(emp => emp.Employee),
                query => query.Include(emp => emp.VacationTypes));

            if (annualvacationEmployee == null)
                return BadRequest("this employee is not assigned to this vacation type");

            double balance = annualvacationEmployee.Balance;

            //  Determine current cycle based on hire date
            DateOnly hireDate = employee.HireDate.Value;
            DateOnly requestDate = newVacation.DateFrom;
            int yearDiff = requestDate.Year - hireDate.Year;
            DateOnly cycleStart = new DateOnly(hireDate.Year + yearDiff, hireDate.Month, hireDate.Day);

            if (requestDate < cycleStart)
                cycleStart = cycleStart.AddYears(-1);

            DateOnly cycleEnd = cycleStart.AddYears(1).AddDays(-1);

            //  Get vacations overlapping this cycle
            var vacationEmployeeList = Unit_Of_Work.vacationEmployee_Repository.FindBy(sem =>
                sem.IsDeleted != true &&
                sem.EmployeeID == newVacation.EmployeeID &&
                sem.VacationTypesID == newVacation.VacationTypesID &&
                sem.DateFrom <= cycleEnd &&
                (sem.DateTo ?? sem.DateFrom) >= cycleStart
            ).ToList();

            //  Calculate already used days clipped to cycle
            double usedDays = 0;
            foreach (var vac in vacationEmployeeList)
            {
                var vacStart = vac.DateFrom;
                var vacEnd = vac.DateTo ?? vac.DateFrom;

                var effectiveStart = vacStart < cycleStart ? cycleStart : vacStart;
                var effectiveEnd = vacEnd > cycleEnd ? cycleEnd : vacEnd;

                if (effectiveStart > effectiveEnd)
                    continue;

                if (vac.HalfDay && effectiveStart == effectiveEnd)
                    usedDays += 0.5;
                else
                    usedDays += (effectiveEnd.DayNumber - effectiveStart.DayNumber) + 1;
            }

            //  Calculate requested vacation days clipped to cycle
            var reqStart = newVacation.DateFrom;
            var reqEnd = newVacation.DateTo ?? newVacation.DateFrom;

            var reqEffectiveStart = reqStart < cycleStart ? cycleStart : reqStart;
            var reqEffectiveEnd = reqEnd > cycleEnd ? cycleEnd : reqEnd;

            double requestedDays = 0;
            if (reqEffectiveStart <= reqEffectiveEnd)
            {
                if (newVacation.HalfDay && reqEffectiveStart == reqEffectiveEnd)
                    requestedDays = 0.5;
                else
                    requestedDays = (reqEffectiveEnd.DayNumber - reqEffectiveStart.DayNumber) + 1;
            }

            //  Validation
            if (usedDays + requestedDays > balance)
            {
                return BadRequest($"Not enough balance. Balance = {balance}, Used = {usedDays}, Requested = {requestedDays}");
            }

            // Save vacation
            VacationEmployee vacationEmployee = mapper.Map<VacationEmployee>(newVacation);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            vacationEmployee.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
                vacationEmployee.InsertedByOctaId = userId;
            else if (userTypeClaim == "employee")
                vacationEmployee.InsertedByUserId = userId;

            Unit_Of_Work.vacationEmployee_Repository.Add(vacationEmployee);
            Unit_Of_Work.SaveChanges();

            return Ok(newVacation);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           allowEdit: 1
       )]
        public async Task<IActionResult> EditAsync(VacationEmployeeAddDTO newVacation)
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

            if (newVacation == null)
            {
                return BadRequest("Vacation cannot be null");
            }
            if (newVacation.ID == null)
            {
                return BadRequest("id can not be null");
            }


            VacationEmployee vacation = Unit_Of_Work.vacationEmployee_Repository.First_Or_Default(s => s.ID == newVacation.ID && s.IsDeleted != true);
            if (vacation == null)
            {
                return BadRequest("VacationEmployee not exist");
            }

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.ID == newVacation.EmployeeID && e.IsDeleted != true);
            if (employee == null)
            {
                return BadRequest("there is no employee with this id");
            }

            VacationTypes type = Unit_Of_Work.vacationTypes_Repository.First_Or_Default(e => e.ID == newVacation.VacationTypesID && e.IsDeleted != true);
            if (type == null)
            {
                return BadRequest("there is no type with this id");
            }

            AnnualVacationEmployee annualvacationEmployee = await Unit_Of_Work.annualVacationEmployee_Repository.FindByIncludesAsync(
                a => a.EmployeeID == newVacation.EmployeeID && a.VacationTypesID == newVacation.VacationTypesID && a.IsDeleted != true,
                query => query.Include(emp => emp.Employee),
                query => query.Include(emp => emp.VacationTypes));

            if (annualvacationEmployee == null)
                return BadRequest("this employee is not assigned to this vacation type");

            double balance = annualvacationEmployee.Balance;

            //  Determine current cycle based on hire date
            DateOnly hireDate = employee.HireDate.Value;
            DateOnly requestDate = newVacation.DateFrom;
            int yearDiff = requestDate.Year - hireDate.Year;
            DateOnly cycleStart = new DateOnly(hireDate.Year + yearDiff, hireDate.Month, hireDate.Day);

            if (requestDate < cycleStart)
                cycleStart = cycleStart.AddYears(-1);

            DateOnly cycleEnd = cycleStart.AddYears(1).AddDays(-1);

            //  Get vacations overlapping this cycle
            var vacationEmployeeList = Unit_Of_Work.vacationEmployee_Repository.FindBy(sem =>
                sem.IsDeleted != true &&
                sem.ID != newVacation.ID &&
                sem.EmployeeID == newVacation.EmployeeID &&
                sem.VacationTypesID == newVacation.VacationTypesID &&
                sem.DateFrom <= cycleEnd &&
                (sem.DateTo ?? sem.DateFrom) >= cycleStart
            );

            //  Calculate already used days clipped to cycle
            double usedDays = 0;
            foreach (var vac in vacationEmployeeList)
            {
                var vacStart = vac.DateFrom;
                var vacEnd = vac.DateTo ?? vac.DateFrom;

                var effectiveStart = vacStart < cycleStart ? cycleStart : vacStart;
                var effectiveEnd = vacEnd > cycleEnd ? cycleEnd : vacEnd;

                if (effectiveStart > effectiveEnd)
                    continue;

                if (vac.HalfDay && effectiveStart == effectiveEnd)
                    usedDays += 0.5;
                else
                    usedDays += (effectiveEnd.DayNumber - effectiveStart.DayNumber) + 1;
            }

            //  Calculate requested vacation days clipped to cycle
            var reqStart = newVacation.DateFrom;
            var reqEnd = newVacation.DateTo ?? newVacation.DateFrom;

            var reqEffectiveStart = reqStart < cycleStart ? cycleStart : reqStart;
            var reqEffectiveEnd = reqEnd > cycleEnd ? cycleEnd : reqEnd;

            double requestedDays = 0;
            if (reqEffectiveStart <= reqEffectiveEnd)
            {
                if (newVacation.HalfDay && reqEffectiveStart == reqEffectiveEnd)
                    requestedDays = 0.5;
                else
                    requestedDays = (reqEffectiveEnd.DayNumber - reqEffectiveStart.DayNumber) + 1;
            }

            //  Validation
            if (usedDays + requestedDays > balance)
            {
                return BadRequest($"Not enough balance. Balance = {balance}, Used = {usedDays}, Requested = {requestedDays}");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Conduct Level", roleId, userId, vacation);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(newVacation, vacation);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            vacation.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                vacation.UpdatedByOctaId = userId;
                if (vacation.UpdatedByUserId != null)
                {
                    vacation.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                vacation.UpdatedByUserId = userId;
                if (vacation.UpdatedByOctaId != null)
                {
                    vacation.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.vacationEmployee_Repository.Update(vacation);
            Unit_Of_Work.SaveChanges();
            return Ok(newVacation);
        }

        ////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1
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
            VacationEmployee vacation = Unit_Of_Work.vacationEmployee_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (vacation == null)
            {
                return BadRequest("Type not exist");
            }
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Conduct Level", roleId, userId, vacation);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }


            vacation.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            vacation.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                vacation.DeletedByOctaId = userId;
                if (vacation.DeletedByUserId != null)
                {
                    vacation.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                vacation.DeletedByUserId = userId;
                if (vacation.DeletedByOctaId != null)
                {
                    vacation.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.vacationEmployee_Repository.Update(vacation);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
