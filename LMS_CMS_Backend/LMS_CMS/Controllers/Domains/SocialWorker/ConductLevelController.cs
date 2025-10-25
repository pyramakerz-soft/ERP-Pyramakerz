using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.DTO.SocialWorker;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.SocialWorker;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.SocialWorker
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class ConductLevelController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public ConductLevelController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
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

            List<ConductLevel> ConductLevels = Unit_Of_Work.conductLevel_Repository.FindBy(t => t.IsDeleted != true);

            if (ConductLevels == null || ConductLevels.Count == 0)
            {
                return NotFound();
            }

            List<GonductLevelGetDTO> Dto = mapper.Map<List<GonductLevelGetDTO>>(ConductLevels);

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

            ConductLevel conductLevel = Unit_Of_Work.conductLevel_Repository.First_Or_Default(sem => sem.IsDeleted != true && sem.ID == id);

            if (conductLevel == null)
            {
                return NotFound();
            }

            GonductLevelGetDTO Dto = mapper.Map<GonductLevelGetDTO>(conductLevel);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Conduct Level" }
        )]
        public async Task<IActionResult> Add(ConductLevelAddDTO NewConduct)
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
            if (NewConduct == null)
            {
                return BadRequest("Conduct is empty");
            }

            ConductLevel conduct = mapper.Map<ConductLevel>(NewConduct);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            conduct.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                conduct.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                conduct.InsertedByUserId = userId;
            }
            Unit_Of_Work.conductLevel_Repository.Add(conduct);
            Unit_Of_Work.SaveChanges();
            return Ok(NewConduct);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           allowEdit: 1,
           pages: new[] { "Conduct Level" }
       )]
        public async Task<IActionResult> EditAsync(ConductLevelAddDTO NewConduct)
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

            if (NewConduct == null)
            {
                return BadRequest("Conduct cannot be null");
            }
            if (NewConduct.ID == null)
            {
                return BadRequest("id can not be null");
            }

            ConductLevel conductLevel = Unit_Of_Work.conductLevel_Repository.First_Or_Default(s => s.ID == NewConduct.ID && s.IsDeleted != true);
            if (conductLevel == null)
            {
                return BadRequest("conduct Level not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Conduct Level", roleId, userId, conductLevel);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(NewConduct, conductLevel);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            conductLevel.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                conductLevel.UpdatedByOctaId = userId;
                if (conductLevel.UpdatedByUserId != null)
                {
                    conductLevel.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                conductLevel.UpdatedByUserId = userId;
                if (conductLevel.UpdatedByOctaId != null)
                {
                    conductLevel.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.conductLevel_Repository.Update(conductLevel);
            Unit_Of_Work.SaveChanges();
            return Ok(NewConduct);
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
            ConductLevel conductLevel = Unit_Of_Work.conductLevel_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (conductLevel == null)
            {
                return BadRequest("Type not exist");
            }
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Conduct Level", roleId, userId, conductLevel);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }


            conductLevel.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            conductLevel.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                conductLevel.DeletedByOctaId = userId;
                if (conductLevel.DeletedByUserId != null)
                {
                    conductLevel.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                conductLevel.DeletedByUserId = userId;
                if (conductLevel.DeletedByOctaId != null)
                {
                    conductLevel.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.conductLevel_Repository.Update(conductLevel);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
