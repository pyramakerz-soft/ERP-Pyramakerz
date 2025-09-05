using AutoMapper;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.DTO.Archiving;
using LMS_CMS_BL.DTO.Communication;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.Archiving;
using LMS_CMS_DAL.Models.Domains.Communication;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Archiving
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class PermissionGroupController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public PermissionGroupController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Permissions Groups" }
        )]
        public async Task<IActionResult> GetAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            int totalRecords = await Unit_Of_Work.permissionGroup_Repository
               .CountAsync(f => f.IsDeleted != true);
             
            List<PermissionGroup> permissionGroups = await Unit_Of_Work.permissionGroup_Repository
                .Select_All_With_IncludesById_Pagination<PermissionGroup>(
                    f => f.IsDeleted != true)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (permissionGroups == null || permissionGroups.Count == 0)
            {
                return NotFound();
            }

            List<PermissionGroupGetDTO> permissionGroupGetDTOs = mapper.Map<List<PermissionGroupGetDTO>>(permissionGroups);

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = permissionGroupGetDTOs, Pagination = paginationMetadata }); 
        } 

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Permissions Groups" }
        )]
        public IActionResult GetById(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (id == 0)
            {
                return BadRequest("Enter Permission Group ID");
            }

            PermissionGroup permissionGroup = Unit_Of_Work.permissionGroup_Repository.First_Or_Default(
                t => t.IsDeleted != true && t.ID == id);


            if (permissionGroup == null)
            {
                return NotFound();
            }

            PermissionGroupGetDTO permissionGroupGetDTO = mapper.Map<PermissionGroupGetDTO>(permissionGroup);

            return Ok(permissionGroupGetDTO);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Permissions Groups" }
        )]
        public IActionResult Add(PermissionGroupAddDTO NewGroup)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (NewGroup == null)
            {
                return BadRequest("Permission Group cannot be null");
            }

            PermissionGroup permissionGroup = mapper.Map<PermissionGroup>(NewGroup);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            permissionGroup.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                permissionGroup.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                permissionGroup.InsertedByUserId = userId;
            }

            Unit_Of_Work.permissionGroup_Repository.Add(permissionGroup);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Permissions Groups" }
        )]
        public IActionResult Edit(PermissionGroupPutDTO EditedGroup)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID, Type claim not found.");
            }

            if (EditedGroup == null)
            {
                return BadRequest("Permission Group cannot be null");
            }

            PermissionGroup PermissionGroupExists = Unit_Of_Work.permissionGroup_Repository.Select_By_Id(EditedGroup.ID);
            if (PermissionGroupExists == null || PermissionGroupExists.IsDeleted == true)
            {
                return NotFound("No Permission Group with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Permissions Groups", roleId, userId, PermissionGroupExists);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(EditedGroup, PermissionGroupExists);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            PermissionGroupExists.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                PermissionGroupExists.UpdatedByOctaId = userId;
                if (PermissionGroupExists.UpdatedByUserId != null)
                {
                    PermissionGroupExists.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                PermissionGroupExists.UpdatedByUserId = userId;
                if (PermissionGroupExists.UpdatedByOctaId != null)
                {
                    PermissionGroupExists.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.permissionGroup_Repository.Update(PermissionGroupExists);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Permissions Groups" }
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

            PermissionGroup permissionGroup = Unit_Of_Work.permissionGroup_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id); 

            if (permissionGroup == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Permissions Groups", roleId, userId, permissionGroup);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            permissionGroup.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            permissionGroup.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                permissionGroup.DeletedByOctaId = userId;
                if (permissionGroup.DeletedByUserId != null)
                {
                    permissionGroup.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                permissionGroup.DeletedByUserId = userId;
                if (permissionGroup.DeletedByOctaId != null)
                {
                    permissionGroup.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.permissionGroup_Repository.Update(permissionGroup);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
