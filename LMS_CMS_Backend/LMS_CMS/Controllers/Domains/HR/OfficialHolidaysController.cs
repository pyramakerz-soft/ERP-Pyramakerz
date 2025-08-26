using AutoMapper;
using LMS_CMS_BL.DTO.HR;
using LMS_CMS_BL.DTO.SocialWorker;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.HR;
using LMS_CMS_DAL.Models.Domains.SocialWorker;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.HR
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class OfficialHolidaysController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public OfficialHolidaysController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
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

            List<OfficialHolidays> officialHolidays = Unit_Of_Work.officialHolidays_Repository.FindBy(t => t.IsDeleted != true);

            if (officialHolidays == null || officialHolidays.Count == 0)
            {
                return NotFound();
            }

            List<OfficialHolidaysGetDTO> Dto = mapper.Map<List<OfficialHolidaysGetDTO>>(officialHolidays);

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

            OfficialHolidays officialHolidays = Unit_Of_Work.officialHolidays_Repository.First_Or_Default(sem => sem.IsDeleted != true && sem.ID == id);

            if (officialHolidays == null)
            {
                return NotFound();
            }

            OfficialHolidaysGetDTO Dto = mapper.Map<OfficialHolidaysGetDTO>(officialHolidays);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Conduct Level" }
         )]
        public async Task<IActionResult> Add(OfficialHolidaysAddDTO newHoliday)
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
            if (newHoliday == null)
            {
                return BadRequest("Conduct is empty");
            }

            OfficialHolidays officialHolidays = mapper.Map<OfficialHolidays>(newHoliday);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            officialHolidays.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                officialHolidays.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                officialHolidays.InsertedByUserId = userId;
            }
            Unit_Of_Work.officialHolidays_Repository.Add(officialHolidays);
            Unit_Of_Work.SaveChanges();
            return Ok(newHoliday);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           allowEdit: 1,
           pages: new[] { "Conduct Level" }
       )]
        public async Task<IActionResult> EditAsync(OfficialHolidaysAddDTO newHoliday)
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

            if (newHoliday == null)
            {
                return BadRequest("Conduct cannot be null");
            }
            if (newHoliday.ID == null)
            {
                return BadRequest("id can not be null");
            }

            OfficialHolidays officialHolidays = Unit_Of_Work.officialHolidays_Repository.First_Or_Default(s => s.ID == newHoliday.ID && s.IsDeleted != true);
            if (officialHolidays == null)
            {
                return BadRequest("conduct Level not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Conduct Level", roleId, userId, officialHolidays);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(newHoliday, officialHolidays);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            officialHolidays.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                officialHolidays.UpdatedByOctaId = userId;
                if (officialHolidays.UpdatedByUserId != null)
                {
                    officialHolidays.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                officialHolidays.UpdatedByUserId = userId;
                if (officialHolidays.UpdatedByOctaId != null)
                {
                    officialHolidays.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.officialHolidays_Repository.Update(officialHolidays);
            Unit_Of_Work.SaveChanges();
            return Ok(newHoliday);
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
            OfficialHolidays officialHolidays = Unit_Of_Work.officialHolidays_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (officialHolidays == null)
            {
                return BadRequest("Type not exist");
            }
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Conduct Level", roleId, userId, officialHolidays);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }


            officialHolidays.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            officialHolidays.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                officialHolidays.DeletedByOctaId = userId;
                if (officialHolidays.DeletedByUserId != null)
                {
                    officialHolidays.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                officialHolidays.DeletedByUserId = userId;
                if (officialHolidays.DeletedByOctaId != null)
                {
                    officialHolidays.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.officialHolidays_Repository.Update(officialHolidays);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
