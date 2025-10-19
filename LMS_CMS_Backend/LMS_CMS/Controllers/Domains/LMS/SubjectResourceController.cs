using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using LMS_CMS_PL.Services.FileValidations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class SubjectResourceController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory; 
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileUploadsService _fileService;
        private readonly FileValidationService _fileValidationService;

        public SubjectResourceController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileUploadsService fileService, FileValidationService fileValidationService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper; 
            _checkPageAccessService = checkPageAccessService;
            _fileService = fileService;
            _fileValidationService = fileValidationService;
        }

        [HttpGet("GetBySubjectId/{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" , "student" },
            pages: new[] { "Subject" }
        )]
        public async Task<IActionResult> GetAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<SubjectResource> subjectResources = await Unit_Of_Work.subjectResource_Repository.Select_All_With_IncludesById<SubjectResource>(
                    f => f.IsDeleted != true && f.SubjectID == id,
                    query => query.Include(emp => emp.Subject));

            if (subjectResources == null || subjectResources.Count == 0)
            {
                return NotFound();
            }

            List<SubjectResourceGetDTO> subjectResourcesDTO = mapper.Map<List<SubjectResourceGetDTO>>(subjectResources);
             
            foreach (var subjectResource in subjectResourcesDTO)
            {
                subjectResource.FileLink = _fileService.GetFileUrl(subjectResource.FileLink, Request, HttpContext);
            }

            return Ok(subjectResourcesDTO);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////
         
        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Subject" }
        )]
        public IActionResult GetByIDAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            SubjectResource subjectResource = Unit_Of_Work.subjectResource_Repository.First_Or_Default(
                    f => f.IsDeleted != true && f.ID == id);

            if (subjectResource == null)
            {
                return NotFound();
            }

            SubjectResourceGetDTO subjectResourceDTO = mapper.Map<SubjectResourceGetDTO>(subjectResource);
             
            subjectResourceDTO.FileLink = _fileService.GetFileUrl(subjectResourceDTO.FileLink, Request, HttpContext);

            return Ok(subjectResourceDTO);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Subject" }
        )]
        public async Task<IActionResult> Add([FromForm] SubjectResourceAddDTO NewSubjectResource)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (NewSubjectResource == null)
            {
                return BadRequest("Subject Resource cannot be null");
            }
             
            Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(g => g.ID == NewSubjectResource.SubjectID && g.IsDeleted != true);
            if (subject == null)
            {
                return BadRequest("No Subject with this ID");
            }

            if (NewSubjectResource.File != null)
            {
                string returnFileInput = await _fileValidationService.ValidateFileWithTimeoutAsync(NewSubjectResource.File);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            SubjectResource subjectResource = mapper.Map<SubjectResource>(NewSubjectResource);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            subjectResource.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                subjectResource.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                subjectResource.InsertedByUserId = userId;
            }

            Unit_Of_Work.subjectResource_Repository.Add(subjectResource);
            Unit_Of_Work.SaveChanges();

            if (NewSubjectResource.File != null)
            {
                subjectResource.FileLink = await _fileService.UploadFileAsync(NewSubjectResource.File, "LMS/SubjectResource", subjectResource.ID, HttpContext);
                Unit_Of_Work.subjectResource_Repository.Update(subjectResource);
                Unit_Of_Work.SaveChanges();
            } 

            return Ok(NewSubjectResource);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Subject" }
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
                return BadRequest("Enter Subject Resource ID");
            }

            SubjectResource subjectResource = Unit_Of_Work.subjectResource_Repository.First_Or_Default(
                    f => f.IsDeleted != true && f.ID == id);

            if (subjectResource == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Subject", roleId, userId, subjectResource);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            subjectResource.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            subjectResource.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                subjectResource.DeletedByOctaId = userId;
                if (subjectResource.DeletedByUserId != null)
                {
                    subjectResource.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                subjectResource.DeletedByUserId = userId;
                if (subjectResource.DeletedByOctaId != null)
                {
                    subjectResource.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.subjectResource_Repository.Update(subjectResource);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
