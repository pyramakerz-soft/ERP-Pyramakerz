using AutoMapper;
using LMS_CMS_BL.DTO.SocialWorker;
using LMS_CMS_BL.UOW;
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
    public class HorizontalMeetingController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public HorizontalMeetingController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" },
        pages: new[] { "Lesson Resources Types" }
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

            List<HorizontalMeeting> horizontalMeetings = Unit_Of_Work.horizontalMeeting_Repository.FindBy(t => t.IsDeleted != true);

            if (horizontalMeetings == null || horizontalMeetings.Count == 0)
            {
                return NotFound();
            }

            List<HorizontalMeetingGetDTO> Dto = mapper.Map<List<HorizontalMeetingGetDTO>>(horizontalMeetings);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Lesson Resources Types" }
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

            HorizontalMeeting horizontalMeeting = Unit_Of_Work.horizontalMeeting_Repository.First_Or_Default(sem => sem.IsDeleted != true && sem.ID == id);

            if (horizontalMeeting == null)
            {
                return NotFound();
            }

            HorizontalMeetingGetDTO Dto = mapper.Map<HorizontalMeetingGetDTO>(horizontalMeeting);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Lesson Resources Types" }
        )]
        public async Task<IActionResult> Add(HorizontalMeetingAddDTO NewMeeting)
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
            if (NewMeeting == null)
            {
                return BadRequest("Meeting is empty");
            }

            HorizontalMeeting meeting = mapper.Map<HorizontalMeeting>(NewMeeting);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            meeting.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                meeting.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                meeting.InsertedByUserId = userId;
            }
            Unit_Of_Work.horizontalMeeting_Repository.Add(meeting);
            Unit_Of_Work.SaveChanges();
            return Ok(NewMeeting);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           allowEdit: 1,
           pages: new[] { "Lesson Resources Types" }
       )]
        public async Task<IActionResult> EditAsync(HorizontalMeetingAddDTO NewMeeting)
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

            if (NewMeeting == null)
            {
                return BadRequest("Meeting cannot be null");
            }
            if (NewMeeting.ID == null)
            {
                return BadRequest("id can not be null");
            }

            HorizontalMeeting horizontalMeeting = Unit_Of_Work.horizontalMeeting_Repository.First_Or_Default(s => s.ID == NewMeeting.ID && s.IsDeleted != true);
            if (horizontalMeeting == null)
            {
                return BadRequest("Meeting not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Lesson Resources Types", roleId, userId, horizontalMeeting);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(NewMeeting, horizontalMeeting);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            horizontalMeeting.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                horizontalMeeting.UpdatedByOctaId = userId;
                if (horizontalMeeting.UpdatedByUserId != null)
                {
                    horizontalMeeting.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                horizontalMeeting.UpdatedByUserId = userId;
                if (horizontalMeeting.UpdatedByOctaId != null)
                {
                    horizontalMeeting.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.horizontalMeeting_Repository.Update(horizontalMeeting);
            Unit_Of_Work.SaveChanges();
            return Ok(NewMeeting);
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
            HorizontalMeeting meeting = Unit_Of_Work.horizontalMeeting_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (meeting == null)
            {
                return BadRequest("meeting not exist");
            }
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Lesson Resources Types", roleId, userId, meeting);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }


            meeting.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            meeting.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                meeting.DeletedByOctaId = userId;
                if (meeting.DeletedByUserId != null)
                {
                    meeting.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                meeting.DeletedByUserId = userId;
                if (meeting.DeletedByOctaId != null)
                {
                    meeting.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.horizontalMeeting_Repository.Update(meeting);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
