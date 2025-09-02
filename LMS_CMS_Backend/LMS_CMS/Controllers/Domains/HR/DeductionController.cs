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
          pages: new[] { "Conduct Level" }
         )]
        public async Task<IActionResult> Get()
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

            List<Deduction> deductions = await Unit_Of_Work.deduction_Repository.Select_All_With_IncludesById<Deduction>(
                    sem => sem.IsDeleted != true,
                    query => query.Include(emp => emp.Employee),
                    query => query.Include(emp => emp.DeductionType));

            if (deductions == null || deductions.Count == 0)
            {
                return NotFound();
            }

            List<DeductionGetDTO> Dto = mapper.Map<List<DeductionGetDTO>>(deductions);

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
            pages: new[] { "Conduct Level" }
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
           pages: new[] { "Conduct Level" }
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
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Conduct Level", roleId, userId, deduction);
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
            Deduction deduction = Unit_Of_Work.deduction_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (deduction == null)
            {
                return BadRequest("deduction not exist");
            }
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Conduct Level", roleId, userId, deduction);
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
    }
}
