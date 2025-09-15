using AutoMapper;
using LMS_CMS_BL.DTO.HR;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.HR;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.HR
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class LocationController : ControllerBase
    {

        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public LocationController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Bonus" }
         )]
        public async Task<IActionResult> GetAsync()
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

            List<Location> locations = Unit_Of_Work.location_Repository.FindBy(sem => sem.IsDeleted != true);

            if (locations == null || locations.Count == 0)
            {
                return NotFound();
            }

            List<LocationGetDTO> Dto = mapper.Map<List<LocationGetDTO>>(locations);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Bonus" }
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

            Location location = Unit_Of_Work.location_Repository.First_Or_Default(sem => sem.IsDeleted != true && sem.ID == id);

            if (location == null)
            {
                return NotFound();
            }

            LocationGetDTO Dto = mapper.Map<LocationGetDTO>(location);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Bonus" }
         )]
        public async Task<IActionResult> Add(LocationAddDTO newLocation)
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
            if (newLocation == null)
            {
                return BadRequest("new Location is empty");
            }

            Location location = mapper.Map<Location>(newLocation);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            location.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                location.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                location.InsertedByUserId = userId;
            }
            Unit_Of_Work.location_Repository.Add(location);
            Unit_Of_Work.SaveChanges();
            return Ok(newLocation);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           allowEdit: 1,
           pages: new[] { "Bonus" }
       )]
        public async Task<IActionResult> EditAsync(LocationAddDTO newLocation)
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

            if (newLocation == null)
            {
                return BadRequest("new Location cannot be null");
            }
            if (newLocation.ID == null)
            {
                return BadRequest("id can not be null");
            }

            Location location = Unit_Of_Work.location_Repository.First_Or_Default(s => s.ID == newLocation.ID && s.IsDeleted != true);
            if (location == null)
            {
                return BadRequest("location not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Bonus", roleId, userId, location);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(newLocation, location);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            location.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                location.UpdatedByOctaId = userId;
                if (location.UpdatedByUserId != null)
                {
                    location.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                location.UpdatedByUserId = userId;
                if (location.UpdatedByOctaId != null)
                {
                    location.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.location_Repository.Update(location);
            Unit_Of_Work.SaveChanges();
            return Ok(newLocation);
        }

        ////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1,
          pages: new[] { "Bonus" }
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
            Location location = Unit_Of_Work.location_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (location == null)
            {
                return BadRequest("bouns not exist");
            }
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Bonus", roleId, userId, location);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            location.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            location.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                location.DeletedByOctaId = userId;
                if (location.DeletedByUserId != null)
                {
                    location.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                location.DeletedByUserId = userId;
                if (location.DeletedByOctaId != null)
                {
                    location.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.location_Repository.Update(location);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
