using AutoMapper;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.Accounting
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class SafeEmployeeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public SafeEmployeeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetBySafeID/{bankID}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Safe" }
        )]
        public IActionResult GetBySafeID(long safeID)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Save safe = Unit_Of_Work.save_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == safeID);
            if (safe == null)
            {
                return BadRequest("No Safe With this ID");
            }

            List<SafeEmployee> safeEmployees = Unit_Of_Work.safeEmployee_Repository.FindBy(
                    f => f.IsDeleted != true && f.SaveID == safeID);

            if (safeEmployees == null || safeEmployees.Count == 0)
            {
                return NotFound();
            }

            List<SafeEmployeeGetDTO> safeEmployeesDTO = mapper.Map<List<SafeEmployeeGetDTO>>(safeEmployees);

            return Ok(safeEmployeesDTO);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Safe" }
        )]
        public IActionResult Add(SafeEmployeeAddDTO NewSafeEmployee)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (NewSafeEmployee == null)
            {
                return BadRequest("Safe Employee cannot be null");
            }

            Save safe = Unit_Of_Work.save_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewSafeEmployee.SaveID);
            if (safe == null)
            {
                return BadRequest("No Safe With this ID");
            }

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewSafeEmployee.EmployeeID);
            if (employee == null)
            {
                return BadRequest("No Employee With this ID");
            }

            SafeEmployee safeEmployee = mapper.Map<SafeEmployee>(NewSafeEmployee);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            safeEmployee.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                safeEmployee.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                safeEmployee.InsertedByUserId = userId;
            }

            Unit_Of_Work.safeEmployee_Repository.Add(safeEmployee);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Safe" }
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

            if (id == 0)
            {
                return BadRequest("Enter Safe Employee ID");
            }

            SafeEmployee safeEmployee = Unit_Of_Work.safeEmployee_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);

            if (safeEmployee == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Safe", roleId, userId, safeEmployee);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            safeEmployee.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            safeEmployee.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                safeEmployee.DeletedByOctaId = userId;
                if (safeEmployee.DeletedByUserId != null)
                {
                    safeEmployee.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                safeEmployee.DeletedByUserId = userId;
                if (safeEmployee.DeletedByOctaId != null)
                {
                    safeEmployee.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.safeEmployee_Repository.Update(safeEmployee);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
