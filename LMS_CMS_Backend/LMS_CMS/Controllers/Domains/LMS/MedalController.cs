using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.DTO.SocialWorker;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.SocialWorker;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using LMS_CMS_PL.Services.FileValidations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class MedalController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileImageValidationService _fileImageValidationService;
        private readonly FileUploadsService _fileService;

        public MedalController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileImageValidationService fileImageValidationService, FileUploadsService fileService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileImageValidationService = fileImageValidationService;
            _fileService = fileService;
        }

        [HttpGet]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Medal", "Student Medal" }
      )]
        public IActionResult GetAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<Medal> medals = Unit_Of_Work.medal_Repository.FindBy(
                    f => f.IsDeleted != true);

            if (medals == null || medals.Count == 0)
            {
                return NotFound();
            }

            List<MedalGetDTO> DTO = mapper.Map<List<MedalGetDTO>>(medals);
             
            foreach (var item in DTO)
            {
                item.ImageLink = _fileService.GetFileUrl(item.ImageLink, Request, HttpContext);
            }

            return Ok(DTO);
        }

        ////////////////////////////////////////////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Medal" }
        )]
        public IActionResult GetById(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Medal medals = Unit_Of_Work.medal_Repository.First_Or_Default(
                    f => f.IsDeleted != true&& f.ID==id);

            if (medals == null )
            {
                return NotFound();
            }

            MedalGetDTO DTO = mapper.Map<MedalGetDTO>(medals);
             
            DTO.ImageLink = _fileService.GetFileUrl(DTO.ImageLink, Request, HttpContext);

            return Ok(DTO);
        }

        ////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Medal" }
        )]
        public async Task<IActionResult> Add([FromForm] MedalAddDto newMedal)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (newMedal == null)
            {
                return BadRequest("Medal cannot be null");
            }
            if (newMedal.EnglishName == null)
            {
                return BadRequest("the name cannot be null");
            }
            if (newMedal.ArabicName == null)
            {
                return BadRequest("the name cannot be null");
            }

            if (newMedal.ImageForm != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(newMedal.ImageForm);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }
             
            Medal medal = mapper.Map<Medal>(newMedal);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            medal.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                medal.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                medal.InsertedByUserId = userId;
            }
            medal.ImageLink = "1";
            Unit_Of_Work.medal_Repository.Add(medal);
            Unit_Of_Work.SaveChanges();
             
            if (newMedal.ImageForm != null)
            {
                medal.ImageLink = await _fileService.UploadFileAsync(newMedal.ImageForm, "LMS/Medal", medal.ID, HttpContext);
                Unit_Of_Work.medal_Repository.Update(medal);
                Unit_Of_Work.SaveChanges();
            }
            return Ok(newMedal);
        }

        ////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee" },
             allowEdit: 1,
            pages: new[] { "Medal" }
        )]
        public async Task<IActionResult> Edit([FromForm] MedalEditDTO newModal)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (newModal == null)
            {
                return BadRequest("Medal cannot be null");
            }


            if (newModal.ImageForm != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(newModal.ImageForm);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            Medal medal = Unit_Of_Work.medal_Repository.Select_By_Id(newModal.ID);

            string imageLinkExists = medal.ImageLink;

            if (medal == null || medal.IsDeleted == true)
            {
                return NotFound("No Medal with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Medal", roleId, userId, medal);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }
            mapper.Map(newModal, medal);

            if (newModal.ImageForm != null)
            {
                medal.ImageLink = await _fileService.ReplaceFileAsync(
                    newModal.ImageForm,
                    imageLinkExists,
                    "LMS/Medal",
                    newModal.ID,
                    HttpContext
                );
            }
            else
            {
                medal.ImageLink = imageLinkExists;
            } 

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            medal.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                medal.UpdatedByOctaId = userId;
                if (medal.UpdatedByUserId != null)
                {
                    medal.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                medal.UpdatedByUserId = userId;
                if (medal.UpdatedByOctaId != null)
                {
                    medal.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.medal_Repository.Update(medal);
            Unit_Of_Work.SaveChanges();
            return Ok(newModal);
        }

        ////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Medal" }
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
                return BadRequest("Enter medal ID");
            }

            Medal medal = Unit_Of_Work.medal_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);


            if (medal == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Medal", roleId, userId, medal);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            medal.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            medal.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                medal.DeletedByOctaId = userId;
                if (medal.DeletedByUserId != null)
                {
                    medal.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                medal.DeletedByUserId = userId;
                if (medal.DeletedByOctaId != null)
                {
                    medal.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.medal_Repository.Update(medal);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
        ///////////////////////////////////////////////////////////////////////////////////////--77
        [HttpGet("MedalToStudentReport")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Medal To Student Report" }
        )]
            public async Task<IActionResult> MedalToStudentReport(
            [FromQuery] long? SchoolId = null,
            [FromQuery] long? GradeId = null,
            [FromQuery] long? ClassroomId = null,
            [FromQuery] long? StudentId = null)
                {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = userClaims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = userClaims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            // Validate that all filters are provided (mandatory)
            if (!SchoolId.HasValue || !GradeId.HasValue || !ClassroomId.HasValue || !StudentId.HasValue)
            {
                return BadRequest("School, Grade, Classroom, and Student are all required.");
            }

            IQueryable<SocialWorkerMedalStudent> query = Unit_Of_Work.socialWorkerMedalStudent_Repository.Query()
                .Where(sms => sms.IsDeleted != true && sms.Student.IsDeleted != true)
                .Join(Unit_Of_Work.studentClassroom_Repository.Query(),
                    sms => sms.StudentID,
                    sc => sc.StudentID,
                    (sms, sc) => new { SocialWorkerMedalStudent = sms, StudentClassroom = sc })
                .Where(joined => joined.StudentClassroom.IsDeleted != true
                    && joined.StudentClassroom.ClassID == ClassroomId.Value
                    && joined.StudentClassroom.Classroom.GradeID == GradeId.Value
                    && joined.StudentClassroom.Classroom.Grade.IsDeleted != true
                    && joined.StudentClassroom.Classroom.Grade.Section.IsDeleted != true
                    && joined.StudentClassroom.Classroom.Grade.Section.school.IsDeleted != true
                    && joined.StudentClassroom.Classroom.Grade.Section.school.ID == SchoolId.Value
                    && joined.SocialWorkerMedalStudent.StudentID == StudentId.Value)
                .Select(joined => joined.SocialWorkerMedalStudent);

            var medalStudents = await query
                .Include(sms => sms.Student)
                .Include(sms => sms.SocialWorkerMedal)
                .Include(sms => sms.InsertedByEmployee)
                .OrderBy(sms => sms.InsertedAt)
                .ToListAsync();

            if (medalStudents == null || medalStudents.Count == 0)
            {
                return NotFound("No medal records found for the specified criteria.");
            }

            var reportData = mapper.Map<List<SocialWorkerMedalStudentReportDTO>>(medalStudents);

            return Ok(reportData);
        }


    }
}
