using AutoMapper;
using LMS_CMS_BL.DTO.Maintenance;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.MaintenanceModule;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.Maintenance
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class MaintenanceCompanyController : ControllerBase
    {


        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;


        public MaintenanceCompanyController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }


        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }, 
            pages: new[] { "Maintenance Companies" , "Maintenance", "Maintenance Report" }
        )]
        public IActionResult GetAll()
        {
            UOW uow = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");


            IEnumerable<MaintenanceCompany> companies = uow.maintenanceCompany_Repository.FindBy(t => t.IsDeleted != true);

            if (companies == null || !companies.Any())
                return NotFound("No Maintenance companies found.");


            List<MaintenanceCompanyGetDto> dtoList = mapper.Map<List<MaintenanceCompanyGetDto>>(companies);

            return Ok(dtoList);
        }


        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }, 
            pages: new[] { "Maintenance Companies" }
        )]
        public IActionResult GetById(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (id == 0)
            {
                return BadRequest("Enter Company ID");
            }

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            MaintenanceCompany? item = Unit_Of_Work.maintenanceCompany_Repository.First_Or_Default(i => i.ID == id && i.IsDeleted != true);


            if (item == null) return NotFound("No Maintenance company with this ID");

            MaintenanceCompanyGetDto dto = mapper.Map<MaintenanceCompanyGetDto>(item);

            return Ok(dto);
        }


        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }, 
            pages: new[] { "Maintenance Companies" }
        )]
        public IActionResult Add(MaintenanceCompanyAddDto model)
        {
            UOW uow = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            if (model == null || string.IsNullOrWhiteSpace(model.Ar_Name) || string.IsNullOrWhiteSpace(model.En_Name))
                return BadRequest("Name is required");

            var cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            MaintenanceCompany? entity = mapper.Map<MaintenanceCompany>(model);
            entity.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa") entity.InsertedByOctaId = userId;
            else if (userTypeClaim == "employee") entity.InsertedByUserId = userId;

            uow.maintenanceCompany_Repository.Add(entity);
            uow.SaveChanges();

            return Ok(model);
        }

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }, 
            allowEdit: 1, 
            pages: new[] { "Maintenance Companies" }
        )]
        public IActionResult Edit(MaintenanceCompanyEditDto model)
        {
            UOW uow = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            if (model == null) return BadRequest();
            if (model == null || string.IsNullOrWhiteSpace(model.Ar_Name) || string.IsNullOrWhiteSpace(model.En_Name))
                return BadRequest("Name is required");

            MaintenanceCompany? entity = uow.maintenanceCompany_Repository.First_Or_Default(i => i.ID == model.ID && i.IsDeleted != true);
            if (entity == null) return NotFound("No Maintenance company with this ID");

            if (userTypeClaim == "employee")
            {
                var accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(uow, "Maintenance Companies", roleId, userId, entity);
                if (accessCheck != null) return accessCheck;
            }

            mapper.Map(model, entity);

            var cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            entity.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                entity.UpdatedByOctaId = userId;
                if (entity.UpdatedByUserId != null) entity.UpdatedByUserId = null;
            }
            else if (userTypeClaim == "employee")
            {
                entity.UpdatedByUserId = userId;
                if (entity.UpdatedByOctaId != null) entity.UpdatedByOctaId = null;
            }

            uow.maintenanceCompany_Repository.Update(entity);
            uow.SaveChanges();

            return Ok(model);
        }

        [HttpDelete]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }, 
            allowDelete: 1, 
            pages: new[] { "Maintenance Companies" }
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

            if (id == 0) return BadRequest("Maintenance company ID cannot be null.");

            MaintenanceCompany? entity = uow.maintenanceCompany_Repository.Select_By_Id(id);

            if (entity == null || entity.IsDeleted == true)
                return NotFound("No Maintenance company with this ID");

            if (userTypeClaim == "employee")
            {
                var accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(uow, "Maintenance Companies", roleId, userId, entity);
                if (accessCheck != null) return accessCheck;
            }

            entity.IsDeleted = true;

            var cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            entity.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                entity.DeletedByOctaId = userId;
                if (entity.DeletedByUserId != null) entity.DeletedByUserId = null;
            }
            else if (userTypeClaim == "employee")
            {
                entity.DeletedByUserId = userId;
                if (entity.DeletedByOctaId != null) entity.DeletedByOctaId = null;
            }

            uow.maintenanceCompany_Repository.Update(entity);
            uow.SaveChanges();

            return Ok();
        } 
    }
}
