using Amazon.S3;
using AutoMapper;
using LMS_CMS_BL.DTO.SocialWorker;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.SocialWorker;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace LMS_CMS_PL.Controllers.Domains.SocialWorker
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class ParentMeetingController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly IConfiguration _configuration;
        private readonly DomainService _domainService;
        private readonly SendNotificationService _sendNotificationService;

        public ParentMeetingController(DbContextFactoryService dbContextFactory, IMapper mapper, SendNotificationService sendNotificationService ,CheckPageAccessService checkPageAccessService, DomainService domainService  , IConfiguration configuration)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _domainService = domainService;
            _configuration = configuration;
            _sendNotificationService = sendNotificationService;

        }

        ////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" ,"parent"},
        pages: new[] { "Parent Meeting" }
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

            List<ParentMeeting> parentMeetings = Unit_Of_Work.parentMeeting_Repository.FindBy(t => t.IsDeleted != true);

            if (parentMeetings == null || parentMeetings.Count == 0)
            {
                return NotFound();
            }

            List<ParentMeetingGetDTO> Dto = mapper.Map<List<ParentMeetingGetDTO>>(parentMeetings);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Parent Meeting" }
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

            ParentMeeting parentMeeting = Unit_Of_Work.parentMeeting_Repository.First_Or_Default(sem => sem.IsDeleted != true && sem.ID == id);

            if (parentMeeting == null)
            {
                return NotFound();
            }

            ParentMeetingGetDTO Dto = mapper.Map<ParentMeetingGetDTO>(parentMeeting);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Parent Meeting" }
        )]
        public async Task<IActionResult> Add(ParentMeetingAddDTO NewMeeting)
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

            ParentMeeting meeting = mapper.Map<ParentMeeting>(NewMeeting);

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
            Unit_Of_Work.parentMeeting_Repository.Add(meeting);
            Unit_Of_Work.SaveChanges();

            //
            var domainName = HttpContext.Request.Headers["Domain-Name"].FirstOrDefault();
            string serverUrl = "";

            bool isProduction = _configuration.GetValue<bool>("IsProduction");

            if (isProduction)
            {
                var domain = _domainService.GetDomain(HttpContext);
                string subDomain = HttpContext.Request.Headers["Domain-Name"].ToString();
                string fullPath = $"{_configuration["AWS:Folder"]}{domain}/{subDomain}/Parent/Meetings";

                AmazonS3Client s3Client = new AmazonS3Client();
                S3Service s3Service = new S3Service(s3Client, _configuration, "AWS:Bucket", "AWS:Folder");
                serverUrl = $"{subDomain}.{domain}/Parent/Appointment";
                Console.WriteLine("----------------------------------------------------------------------------------------------------");
                Console.WriteLine(serverUrl, domain, subDomain);
            }
            else
            {
                serverUrl = $"http://localhost:4200/Parent/Meetings";

            }
            List<Parent> parents = Unit_Of_Work.parent_Repository.FindBy(s=>s.IsDeleted != true );
            foreach (var item in parents)
            {
              await _sendNotificationService.SendNotificationAsync(Unit_Of_Work, "New parent meeting available. Tap to view details.", serverUrl, 3, item.ID, domainName);
            }

            return Ok(NewMeeting);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           allowEdit: 1,
           pages: new[] { "Parent Meeting" }
       )]
        public async Task<IActionResult> EditAsync(ParentMeetingAddDTO NewMeeting)
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

            ParentMeeting parentMeeting = Unit_Of_Work.parentMeeting_Repository.First_Or_Default(s => s.ID == NewMeeting.ID && s.IsDeleted != true);
            if (parentMeeting == null)
            {
                return BadRequest("Meeting Level not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Parent Meeting", roleId, userId, parentMeeting);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(NewMeeting, parentMeeting);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            parentMeeting.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                parentMeeting.UpdatedByOctaId = userId;
                if (parentMeeting.UpdatedByUserId != null)
                {
                    parentMeeting.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                parentMeeting.UpdatedByUserId = userId;
                if (parentMeeting.UpdatedByOctaId != null)
                {
                    parentMeeting.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.parentMeeting_Repository.Update(parentMeeting);
            Unit_Of_Work.SaveChanges();
            return Ok(NewMeeting);
        }

        ////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1,
          pages: new[] { "Parent Meeting" }
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
            ParentMeeting meeting = Unit_Of_Work.parentMeeting_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (meeting == null)
            {
                return BadRequest("meeting not exist");
            }
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Parent Meeting", roleId, userId, meeting);
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

            Unit_Of_Work.parentMeeting_Repository.Update(meeting);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
