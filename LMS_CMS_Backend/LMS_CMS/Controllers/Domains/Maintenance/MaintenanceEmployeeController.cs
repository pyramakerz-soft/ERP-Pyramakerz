using AutoMapper;
using LMS_CMS_BL.DTO.Maintenance;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.MaintenanceModule;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Maintenance
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class MaintenanceEmployeeController : ControllerBase
    {

        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
         
        public MaintenanceEmployeeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }


        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }, 
            pages: new[] { "Maintenance Employees" }
        )]
        public async Task<IActionResult> GetAllAsync()
        {

            UOW uow = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");


            List<MaintenanceEmployee> Employees = await uow.maintenanceEmployee_Repository.Select_All_With_IncludesById<MaintenanceEmployee>(
                t => t.IsDeleted != true,
                quer => quer.Include(e => e.Employee)
                );

            if (Employees == null || !Employees.Any())
                return NotFound("No Maintenance employees found.");


            List<MaintenanceEmployeeGetDto> dtoList = mapper.Map<List<MaintenanceEmployeeGetDto>>(Employees);

            return Ok(dtoList);
        }

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }, 
            pages: new[] { "Maintenance Employees" }
        )]
        public async Task<IActionResult> GetByIdAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (id == 0)
            {
                return BadRequest("Enter employee ID");
            }

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            MaintenanceEmployee? item = await Unit_Of_Work.maintenanceEmployee_Repository.FindByIncludesAsync(i => i.ID == id && i.IsDeleted != true, quer => quer.Include(e => e.Employee));

            if (item == null) return NotFound("No employee with this ID");

            MaintenanceEmployeeGetDto dto = mapper.Map<MaintenanceEmployeeGetDto>(item);

            return Ok(dto);
        }

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }, 
            pages: new[] { "Maintenance Employees" }
        )]
        public IActionResult Add(MaintenanceEmployeeAddDto model)
        {
            UOW uow = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (model == null)
                return BadRequest("Invalid employee data.");

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            var employeeExists = uow.employee_Repository.First_Or_Default(e => e.ID == model.EmployeeID && e.IsDeleted != true);

            if (employeeExists == null)
            {
                return NotFound($"Employee with this ID does not exist.");
            }

            MaintenanceEmployee maintenanceEmployeeExists = uow.maintenanceEmployee_Repository
                                        .First_Or_Default(me => me.EmployeeID == model.EmployeeID && me.IsDeleted != true);

            if (maintenanceEmployeeExists != null)
            {
                return BadRequest($"Employee is already added to Maintenance Employees.");
            }


            var cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            MaintenanceEmployee? entity = mapper.Map<MaintenanceEmployee>(model);
             entity.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa") entity.InsertedByOctaId = userId;
            else if (userTypeClaim == "employee") entity.InsertedByUserId = userId;

            uow.maintenanceEmployee_Repository.Add(entity);
            uow.SaveChanges();

            return Ok(model);
        }

        [HttpDelete]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }, 
            allowDelete: 1, 
            pages: new[] { "Maintenance Employees" }
        )]
        public IActionResult Delete(long id)
        {
            UOW uow = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            if (id == 0) return BadRequest("Enter employee ID");

            MaintenanceEmployee? entity = uow.maintenanceEmployee_Repository
                                             .First_Or_Default(i => i.ID == id && i.IsDeleted != true);
            if (entity == null) return NotFound("No Maintenance Employee with this ID");

            
            if (userTypeClaim == "employee")
            {
                var accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(uow, "Maintenance Employees", roleId, userId, entity);
                if (accessCheck != null) return accessCheck;
            }

            var cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            entity.IsDeleted = true;
            entity.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                entity.DeletedByOctaId = userId;
                entity.DeletedByUserId = null;
            }
            else if (userTypeClaim == "employee")
            {
                entity.DeletedByUserId = userId;
                entity.DeletedByOctaId = null;
            }

            uow.maintenanceEmployee_Repository.Update(entity);
            uow.SaveChanges();

            return Ok();
        } 
    }
}
