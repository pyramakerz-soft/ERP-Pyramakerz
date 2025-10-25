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
    public class IssueTypeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public IssueTypeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
               allowedTypes: new[] { "octa", "employee" },
               pages: new[] { "Issues Types" }
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

            List<IssuesType> issuesTypes = Unit_Of_Work.issuesType_Repository.FindBy(t => t.IsDeleted != true);

            if (issuesTypes == null || issuesTypes.Count == 0)
            {
                return NotFound();
            }

            List<IssueTypeGetDTO> Dto = mapper.Map<List<IssueTypeGetDTO>>(issuesTypes);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Issues Types" }
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

            IssuesType issuesType = Unit_Of_Work.issuesType_Repository.First_Or_Default(sem => sem.IsDeleted != true && sem.ID == id);

            if (issuesType == null)
            {
                return NotFound();
            }

            IssueTypeGetDTO Dto = mapper.Map<IssueTypeGetDTO>(issuesType);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Issues Types" }
        )]
        public async Task<IActionResult> Add(IssueTypeAddDTO NewIssue)
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
            if (NewIssue == null)
            {
                return BadRequest("Issue is empty");
            }

            IssuesType issuesType = mapper.Map<IssuesType>(NewIssue);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            issuesType.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                issuesType.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                issuesType.InsertedByUserId = userId;
            }
            Unit_Of_Work.issuesType_Repository.Add(issuesType);
            Unit_Of_Work.SaveChanges();
            return Ok(NewIssue);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           allowEdit: 1,
           pages: new[] { "Issues Types" }
       )]
        public async Task<IActionResult> EditAsync(IssueTypeAddDTO NewIssue)
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

            if (NewIssue == null)
            {
                return BadRequest("Issue cannot be null");
            }
            if (NewIssue.ID == null)
            {
                return BadRequest("id can not be null");
            }

            IssuesType issuetype = Unit_Of_Work.issuesType_Repository.First_Or_Default(s => s.ID == NewIssue.ID && s.IsDeleted != true);
            if (issuetype == null)
            {
                return BadRequest("IssuesType Level not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Issues Types", roleId, userId, issuetype);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(NewIssue, issuetype);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            issuetype.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                issuetype.UpdatedByOctaId = userId;
                if (issuetype.UpdatedByUserId != null)
                {
                    issuetype.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                issuetype.UpdatedByUserId = userId;
                if (issuetype.UpdatedByOctaId != null)
                {
                    issuetype.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.issuesType_Repository.Update(issuetype);
            Unit_Of_Work.SaveChanges();
            return Ok(NewIssue);
        }

        ////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1,
          pages: new[] { "Issues Types" }
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
            IssuesType issuetype = Unit_Of_Work.issuesType_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (issuetype == null)
            {
                return BadRequest("IssuesType Level not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Issues Types", roleId, userId, issuetype);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }


            issuetype.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            issuetype.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                issuetype.DeletedByOctaId = userId;
                if (issuetype.DeletedByUserId != null)
                {
                    issuetype.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                issuetype.DeletedByUserId = userId;
                if (issuetype.DeletedByOctaId != null)
                {
                    issuetype.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.issuesType_Repository.Update(issuetype);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
