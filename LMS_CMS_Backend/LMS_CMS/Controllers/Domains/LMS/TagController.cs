using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class TagController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public TagController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }
        ///////////////////////////////////////////////////////////////////////////////////
        [HttpGet]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" } 
        )]
        public IActionResult Get()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<Tag> Data;

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            Data = Unit_Of_Work.tag_Repository.FindBy(t => t.IsDeleted != true);

            if (Data == null || Data.Count == 0)
            {
                return NotFound();
            }

            List<TagGetDTO> Dto = mapper.Map<List<TagGetDTO>>(Data);

            return Ok(Dto);
        }

        ///////////////////////////////////////////////////////////////////////////////////
        
        [HttpGet("byLessonId/{id}")]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee" }
          )]
        public IActionResult GetByLessonId(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            List<LessonTag> lessonTags = Unit_Of_Work.lessonTag_Repository.FindBy(s => s.LessonID == id && s.IsDeleted != true);

            List<long> tagIds = lessonTags.Select(s => s.TagID).Distinct().ToList();

            if (tagIds.Count == 0)
                return NotFound("No tags found for this lesson.");

            List<Tag> tags = Unit_Of_Work.tag_Repository.FindBy(t => t.IsDeleted != true && tagIds.Contains(t.ID));

            if (tags == null || tags.Count == 0)
                return NotFound("Tags not found in database.");

            List<TagGetDTO> dto = mapper.Map<List<TagGetDTO>>(tags);

            return Ok(dto);
        }

    }
}
