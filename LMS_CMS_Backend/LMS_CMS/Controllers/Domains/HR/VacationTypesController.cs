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

namespace LMS_CMS_PL.Controllers.Domains.HR
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class VacationTypesController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public VacationTypesController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
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
        public IActionResult Get()
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

            List<VacationTypes> vacationTypes = Unit_Of_Work.vacationTypes_Repository.FindBy(t => t.IsDeleted != true);

            if (vacationTypes == null || vacationTypes.Count == 0)
            {
                return NotFound();
            }

            List<VacationTypesGetDTO> Dto = mapper.Map<List<VacationTypesGetDTO>>(vacationTypes);

            return Ok(Dto);
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

            VacationTypes vacationType = Unit_Of_Work.vacationTypes_Repository.First_Or_Default(sem => sem.IsDeleted != true && sem.ID == id);

            if (vacationType == null)
            {
                return NotFound();
            }

            VacationTypesGetDTO Dto = mapper.Map<VacationTypesGetDTO>(vacationType);

            return Ok(Dto);
        }
        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Conduct Level" }
         )]
        public async Task<IActionResult> Add(VacationTypesAddDTO newVacation)
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
            if (newVacation == null)
            {
                return BadRequest("Conduct is empty");
            }

            VacationTypes vacation = mapper.Map<VacationTypes>(newVacation);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            vacation.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                vacation.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                vacation.InsertedByUserId = userId;
            }
            Unit_Of_Work.vacationTypes_Repository.Add(vacation);
            Unit_Of_Work.SaveChanges();

            // Add this Vacation types for all employee 
            List<Employee> employees = Unit_Of_Work.employee_Repository.FindBy(e=>e.IsDeleted!= true);
            foreach (Employee employee in employees)
            {
                var annualVacation = new AnnualVacationEmployee();
                annualVacation.EmployeeID = employee.ID;
                annualVacation.VacationTypesID = vacation.ID;
                Unit_Of_Work.annualVacationEmployee_Repository.Add(annualVacation);
                Unit_Of_Work.SaveChanges();
            }
            return Ok(newVacation);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           allowEdit: 1,
           pages: new[] { "Conduct Level" }
       )]
        public async Task<IActionResult> EditAsync(VacationTypesAddDTO newVacation)
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

            VacationTypes vacation = Unit_Of_Work.vacationTypes_Repository.First_Or_Default(s => s.ID == newVacation.ID && s.IsDeleted != true);
            if (vacation == null)
            {
                return BadRequest("VacationTypes not exist");
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
            Unit_Of_Work.vacationTypes_Repository.Update(vacation);
            Unit_Of_Work.SaveChanges();
            return Ok(newVacation);
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
            VacationTypes vacation = Unit_Of_Work.vacationTypes_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
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

            Unit_Of_Work.vacationTypes_Repository.Update(vacation);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
