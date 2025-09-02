using AutoMapper;
using LMS_CMS_BL.DTO.Archiving;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.Archiving;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.Archiving
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class PermissionGroupEmployeeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public PermissionGroupEmployeeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("ByPermissionGroupID/{PGID}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Permissions Group Employee" }
        )]
        public IActionResult GetAsync(long PGID)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            PermissionGroup permissionGroup = Unit_Of_Work.permissionGroup_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == PGID);
            if (permissionGroup == null)
            {
                return BadRequest("No Permission Group with this ID");
            }

            List<PermissionGroupEmployee> permissionGroupEmployees = Unit_Of_Work.permissionGroupEmployee_Repository.FindBy(f => f.IsDeleted != true && f.PermissionGroupID == PGID && f.Employee.IsDeleted != true && f.PermissionGroup.IsDeleted != true);

            if (permissionGroupEmployees == null || permissionGroupEmployees.Count == 0)
            {
                return NotFound();
            }

            List<PermissionGroupEmployeeGetDTO> permissionGroupEmployeeGetDTOs = mapper.Map<List<PermissionGroupEmployeeGetDTO>>(permissionGroupEmployees);

            return Ok(permissionGroupEmployeeGetDTOs);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Permissions Group Employee" }
        )]
        public IActionResult GetById(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (id == 0)
            {
                return BadRequest("Enter Permission Group ID");
            }

            PermissionGroupEmployee permissionGroupEmployee = Unit_Of_Work.permissionGroupEmployee_Repository.First_Or_Default(
                t => t.IsDeleted != true && t.ID == id && t.Employee.IsDeleted != true && t.PermissionGroup.IsDeleted != true);
             
            if (permissionGroupEmployee == null)
            {
                return NotFound();
            }

            PermissionGroupEmployeeGetDTO permissionGroupEmployeeGetDTO = mapper.Map<PermissionGroupEmployeeGetDTO>(permissionGroupEmployee);

            return Ok(permissionGroupEmployeeGetDTO);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Permissions Group Employee" }
        )]
        public IActionResult Add(PermissionGroupEmployeeAddDTO NewPermissionEmployee)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (NewPermissionEmployee == null)
            {
                return BadRequest("Permission Group Employee cannot be null");
            }

            PermissionGroup permissionGroup = Unit_Of_Work.permissionGroup_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewPermissionEmployee.PermissionGroupID);
            if (permissionGroup == null)
            {
                return BadRequest("No Permission Group with this ID");
            }

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewPermissionEmployee.EmployeeID);
            if (employee == null)
            {
                return BadRequest("No Employee with this ID");
            }

            PermissionGroupEmployee permissionGroupEmployee = mapper.Map<PermissionGroupEmployee>(NewPermissionEmployee);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            permissionGroupEmployee.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                permissionGroupEmployee.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                permissionGroupEmployee.InsertedByUserId = userId;
            }

            Unit_Of_Work.permissionGroupEmployee_Repository.Add(permissionGroupEmployee);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
          
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Permissions Group Employee" }
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
                return BadRequest("Enter Permission Group ID");
            }

            PermissionGroupEmployee permissionGroupEmployee = Unit_Of_Work.permissionGroupEmployee_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);

            if (permissionGroupEmployee == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Permissions Group Employee", roleId, userId, permissionGroupEmployee);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            permissionGroupEmployee.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            permissionGroupEmployee.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                permissionGroupEmployee.DeletedByOctaId = userId;
                if (permissionGroupEmployee.DeletedByUserId != null)
                {
                    permissionGroupEmployee.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                permissionGroupEmployee.DeletedByUserId = userId;
                if (permissionGroupEmployee.DeletedByOctaId != null)
                {
                    permissionGroupEmployee.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.permissionGroupEmployee_Repository.Update(permissionGroupEmployee);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
