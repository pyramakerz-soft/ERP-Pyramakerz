using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class WeightTypeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory; 
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public WeightTypeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper; 
            _checkPageAccessService = checkPageAccessService;
        }

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Weight Types" }
        )]
        public async Task<IActionResult> GetAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<WeightType> weightTypes = Unit_Of_Work.weightType_Repository.FindBy(f => f.IsDeleted != true);

            if (weightTypes == null || weightTypes.Count == 0)
            {
                return NotFound();
            }

            List<WeightTypeGetDTO> weightTypesDTO = mapper.Map<List<WeightTypeGetDTO>>(weightTypes);
             
            return Ok(weightTypesDTO);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////
         
        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Weight Types" }
        )]
        public async Task<IActionResult> GetById(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (id == 0)
            {
                return BadRequest("Enter Subject ID");
            }

            WeightType weightType = Unit_Of_Work.weightType_Repository.First_Or_Default(
                t => t.IsDeleted != true && t.ID == id);
             
            if (weightType == null)
            {
                return NotFound();
            }

            WeightTypeGetDTO weightTypeDTO = mapper.Map<WeightTypeGetDTO>(weightType);

            return Ok(weightTypeDTO);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Weight Types" }
        )]
        public async Task<IActionResult> Add(WeightTypeAddDTO NewWeightType)
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
            if (NewWeightType == null)
            {
                return BadRequest("Weight Type can not be null");
            }

            WeightType weightType = mapper.Map<WeightType>(NewWeightType);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            weightType.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                weightType.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                weightType.InsertedByUserId = userId;
            }

            Unit_Of_Work.weightType_Repository.Add(weightType);
            Unit_Of_Work.SaveChanges();
            return Ok(NewWeightType);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Weight Types" }
        )]
        public async Task<IActionResult> Edit(WeightTypePutDTO EditWeightType)
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
            if (EditWeightType == null)
            {
                return BadRequest("Weight Type can not be null");
            }

            WeightType weightType = Unit_Of_Work.weightType_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == EditWeightType.ID);
            if (weightType == null)
            {
                return NotFound("No Weight Type With this ID");
            }
             
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Weight Types", roleId, userId, EditWeightType);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }
             
            mapper.Map(EditWeightType, weightType);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            weightType.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                weightType.UpdatedByOctaId = userId;
                if (weightType.UpdatedByUserId != null)
                {
                    weightType.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                weightType.UpdatedByUserId = userId;
                if (weightType.UpdatedByOctaId != null)
                {
                    weightType.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.weightType_Repository.Update(weightType);
            Unit_Of_Work.SaveChanges();
            return Ok(EditWeightType);
        }

        ////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Weight Types" }
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

            WeightType weightType = Unit_Of_Work.weightType_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == id);

            if (weightType == null)
            {
                return NotFound("No Weight Type with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Weight Types", roleId, userId, weightType);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            weightType.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            weightType.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                weightType.DeletedByOctaId = userId;
                if (weightType.DeletedByUserId != null)
                {
                    weightType.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                weightType.DeletedByUserId = userId;
                if (weightType.DeletedByOctaId != null)
                {
                    weightType.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.weightType_Repository.Update(weightType);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
