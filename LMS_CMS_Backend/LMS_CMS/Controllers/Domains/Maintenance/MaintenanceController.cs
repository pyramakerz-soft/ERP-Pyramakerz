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
using Microsoft.EntityFrameworkCore.Internal;
using System.Linq;
using static Amazon.S3.Util.S3EventNotification;

namespace LMS_CMS_PL.Controllers.Domains.Maintenance
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class MaintenanceController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public MaintenanceController(
            DbContextFactoryService dbContextFactory,
            IMapper mapper,
            CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        [HttpGet]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Maintenance" })]
        public async Task<IActionResult> GetAllAsync()
        {
            UOW uow = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            List<LMS_CMS_DAL.Models.Domains.MaintenanceModule.Maintenance> records = await uow.maintenance_Repository
                .Select_All_With_IncludesById<LMS_CMS_DAL.Models.Domains.MaintenanceModule.Maintenance>(
                    t => t.IsDeleted != true,
                    query => query
                        .Include(m => m.Item)
                        .Include(m => m.Company)
                        .Include(m => m.MaintenanceEmployee.Employee)
                );


            if (records == null || !records.Any())
                return NotFound("No Maintenance records found.");

            List<MaintenanceGetDto> dtoList = mapper.Map<List<MaintenanceGetDto>>(records);

            return Ok(dtoList);
        }


        [HttpGet("WithPaggination")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Maintenance" })]
        public async Task<IActionResult> GetAllAsyncWithPaggination([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            UOW uow = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            int totalRecords = await uow.maintenance_Repository
            .CountAsync(f => f.IsDeleted != true);

            List<LMS_CMS_DAL.Models.Domains.MaintenanceModule.Maintenance> records = await uow.maintenance_Repository
                .Select_All_With_IncludesById<LMS_CMS_DAL.Models.Domains.MaintenanceModule.Maintenance>(
                    t => t.IsDeleted != true,
                    query => query
                        .Include(m => m.Item)
                        .Include(m => m.Company)
                        .Include(m => m.MaintenanceEmployee.Employee)
                );


            if (records == null || !records.Any())
                return NotFound("No Maintenance records found.");

            List<MaintenanceGetDto> dtoList = mapper.Map<List<MaintenanceGetDto>>(records);
            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = dtoList, Pagination = paginationMetadata });
        }


        [HttpGet("{id}")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Maintenance" })]
        public async Task<IActionResult> GetByIdAsync(long id)
        {
            if (id == 0) return BadRequest("Enter Maintenance ID");

            UOW uow = _dbContextFactory.CreateOneDbContext(HttpContext);


            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            LMS_CMS_DAL.Models.Domains.MaintenanceModule.Maintenance? item = await uow.maintenance_Repository
                    .FindByIncludesAsync(
                      i => i.ID == id && i.IsDeleted != true,
                         query => query
                           .Include(m => m.Item)
                           .Include(m => m.Company)
                           .Include(m => m.MaintenanceEmployee.Employee)
                );

            if (item == null) return NotFound("No Maintenance record with this ID");

            MaintenanceGetDto dto = mapper.Map<MaintenanceGetDto>(item);

            return Ok(dto);

        }
        [HttpPost]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, allowEdit: 1, pages: new[] { "Maintenance" })]
        public IActionResult Add(MaintenanceAddDto model)
        {
            UOW uow = _dbContextFactory.CreateOneDbContext(HttpContext);
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");
            if (model == null)
                return BadRequest("Model is null");

            if (model.Date == default)
                return BadRequest("Date is required.");

            MaintenanceItem item = uow.maintenanceItem_Repository.First_Or_Default(i => i.ID == model.ItemID && i.IsDeleted != true);
            if (item == null)
                return NotFound($"Maintenance Item with ID {model.ItemID} not found.");

            bool hasEmployee = model.MaintenanceEmployeeID.HasValue;
            bool hasCompany = model.CompanyID.HasValue;

            if (hasEmployee && hasCompany)
                return BadRequest("You cannot provide both EmployeeID and CompanyID. Choose one.");

            if (!hasEmployee && !hasCompany)
                return BadRequest("You must provide either EmployeeID or CompanyID.");
             
            if (hasEmployee)
            {
                var emp = uow.maintenanceEmployee_Repository.First_Or_Default(e => e.ID == model.MaintenanceEmployeeID && e.IsDeleted != true);
                if (emp == null)
                    return NotFound($"Employee with this ID is not found."); 
            }

            if (hasCompany)
            {
                var comp = uow.maintenanceCompany_Repository.First_Or_Default(c => c.ID == model.CompanyID && c.IsDeleted != true);
                if (comp == null)
                    return NotFound($"Company with this ID is not found."); 
            }

            LMS_CMS_DAL.Models.Domains.MaintenanceModule.Maintenance record = mapper.Map<LMS_CMS_DAL.Models.Domains.MaintenanceModule.Maintenance>(model);
 

            if (model.CompanyID == 0)
            {
                model.CompanyID = null;
            }
            if (model.MaintenanceEmployeeID == 0)
            {
                model.MaintenanceEmployeeID = null;
            }
            var cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            record.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);


            if (userTypeClaim == "octa")
            {
                record.InsertedByOctaId = userId;

            }
            else if (userTypeClaim == "employee")
            {
                record.InsertedByUserId = userId;

            }


            uow.maintenance_Repository.Add(record);
            uow.SaveChanges();

            return Ok(model);
        }
        [HttpPut]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, allowEdit: 1, pages: new[] { "Maintenance" })]
        public IActionResult Edit(MaintenanceEditDto model)
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

            LMS_CMS_DAL.Models.Domains.MaintenanceModule.Maintenance entity = uow.maintenance_Repository.First_Or_Default(i => i.ID == model.ID && i.IsDeleted != true);
            if (entity == null) return NotFound("No Maintenance record with this ID");

            if (userTypeClaim == "employee")
            {
                var accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(uow, "Maintenance", roleId, userId, entity);
                if (accessCheck != null) return accessCheck;
            }

            MaintenanceItem item = uow.maintenanceItem_Repository.First_Or_Default(i => i.ID == model.ItemID && i.IsDeleted != true);
            if (item == null)
                return NotFound($"Maintenance Item with ID {model.ItemID} not found.");

            bool hasEmployee = model.MaintenanceEmployeeID.HasValue;
            bool hasCompany = model.CompanyID.HasValue;

            if (hasEmployee && hasCompany)
                return BadRequest("You cannot provide both EmployeeID and CompanyID. Choose one.");
            if (!hasEmployee && !hasCompany)
                return BadRequest("You must provide either EmployeeID or CompanyID.");

            if (hasEmployee)
            {
                var emp = uow.maintenanceEmployee_Repository.First_Or_Default(e => e.ID == model.MaintenanceEmployeeID && e.IsDeleted != true);
                if (emp == null) return NotFound("Employee not found");
            }
            else if (hasCompany)
            {
                var comp = uow.maintenanceCompany_Repository.First_Or_Default(c => c.ID == model.CompanyID && c.IsDeleted != true);
                if (comp == null) return NotFound("Company not found");
            }


            if (model.CompanyID == 0)
            {
                model.CompanyID = null;
            }
            if (model.MaintenanceEmployeeID == 0)
            {
                model.MaintenanceEmployeeID = null;
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

            uow.maintenance_Repository.Update(entity);
            uow.SaveChanges();

            return Ok(model);
        }


        [HttpDelete("{id}")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, allowDelete: 1, pages: new[] { "Maintenance" })]
        public IActionResult SoftDelete(long id)
        {
            UOW uow = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            LMS_CMS_DAL.Models.Domains.MaintenanceModule.Maintenance? entity = uow.maintenance_Repository.First_Or_Default(i => i.ID == id && i.IsDeleted != true);
            if (entity == null) return NotFound("No Maintenance record with this ID");

            if (userTypeClaim == "employee")
            {
                var accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(uow, "Maintenance", roleId, userId, entity);
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

            uow.maintenance_Repository.Update(entity);
            uow.SaveChanges();

            return Ok();
        }
        [HttpPost("report")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Maintenance", "Maintenance Report" })]
        public async Task<IActionResult> GetReport([FromBody] MaintenanceReportRequestDto request)
        {
            UOW uow = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            if (request == null)
                return BadRequest("Invalid request.");

            if (request.FromDate == default || request.ToDate == default)
                return BadRequest("StartDate and EndDate are required.");

            if (request.MaintenanceEmployeeId.HasValue && request.CompanyId.HasValue)
                return BadRequest("You cannot filter by both Employee and Company at the same time.");


            if (request.FilterBy.HasValue)
            {
                if (request.FilterBy.Value == 1 && request.MaintenanceEmployeeId.HasValue)
                    return BadRequest("You cannot pass MaintenanceEmployeeId when filtering by Company.");
                else if (request.FilterBy.Value == 2 && request.CompanyId.HasValue)
                    return BadRequest("You cannot pass CompanyId when filtering by Employee.");
            }

            //IQueryable<LMS_CMS_DAL.Models.Domains.MaintenanceModule.Maintenance> query =
            //               uow.maintenance_Repository.Query()
            //                  .Include(m => m.Item)
            //                  .Include(m => m.Company)
            //                  .Include(m => m.MaintenanceEmployee).ThenInclude(me => me.Employee)
            //                  .Where(m => m.IsDeleted != true && m.Date >= request.FromDate && m.Date <= request.ToDate);

            List<LMS_CMS_DAL.Models.Domains.MaintenanceModule.Maintenance> query = await uow.maintenance_Repository.Select_All_With_IncludesById<LMS_CMS_DAL.Models.Domains.MaintenanceModule.Maintenance>(
                              t => t.IsDeleted != true && t.Date >= request.FromDate && t.Date <= request.ToDate,
                              query => query.Include(m => m.Item), 
                              query => query.Include(m => m.Company),
                              query => query.Include(m => m.MaintenanceEmployee).ThenInclude(me => me.Employee)
                           );

            //if (!query.Any())
            //    return NotFound("No Maintenance records found for this filter.");

            if (request.ItemId.HasValue && request.ItemId.Value > 0)
            {
                query = query.Where(m => m.ItemID == request.ItemId.Value).ToList();
            }


            // 1 = Company 
            // 2 = Employee 
            if (request.FilterBy == 1)
            {
                
                if (request.CompanyId.HasValue && request.CompanyId.Value > 0)
                {
                    query = query.Where(m => m.CompanyID == request.CompanyId.Value).ToList();
                }
                else
                {
                    query = query.Where(m => m.CompanyID.HasValue && m.CompanyID > 0).ToList();
                }
            }
            else if (request.FilterBy == 2)
            {
                if (request.MaintenanceEmployeeId.HasValue && request.MaintenanceEmployeeId.Value > 0)
                {
                    query = query.Where(m => m.MaintenanceEmployeeID == request.MaintenanceEmployeeId.Value).ToList();
                }
                else
                {
                    query = query.Where(m => m.MaintenanceEmployeeID.HasValue && m.MaintenanceEmployeeID > 0).ToList();
                }
            }
            else
            {
                // FilterBy = null the then allow both filters if provided
                if (request.CompanyId.HasValue && request.CompanyId.Value > 0)
                    query = query.Where(m => m.CompanyID == request.CompanyId.Value).ToList();

                if (request.MaintenanceEmployeeId.HasValue && request.MaintenanceEmployeeId.Value > 0)
                    query = query.Where(m => m.MaintenanceEmployeeID == request.MaintenanceEmployeeId.Value).ToList();
            }





            List<MaintenanceGetDto> dtoList = mapper.Map<List<MaintenanceGetDto>>(query);

            return Ok(dtoList);

        }
    }
}
