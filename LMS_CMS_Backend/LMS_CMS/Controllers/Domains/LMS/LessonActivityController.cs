using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Communication;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using LMS_CMS_PL.Services.FileValidations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class LessonActivityController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileValidationService _fileValidationService;

        public LessonActivityController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileValidationService fileValidationService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileValidationService = fileValidationService;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetByLessonID/{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Lesson Activity" }
        )]
        public async Task<IActionResult> GetAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Lesson lesson = Unit_Of_Work.lesson_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == id);
            if (lesson == null)
            {
                return NotFound("No Lesson With this ID");
            }

            List<LessonActivity> lessonActivities = await Unit_Of_Work.lessonActivity_Repository.Select_All_With_IncludesById<LessonActivity>(
                    f => f.IsDeleted != true && f.LessonID == id,
                    query => query.Include(emp => emp.Lesson),
                    query => query.Include(emp => emp.LessonActivityType)
                    );

            if (lessonActivities == null || lessonActivities.Count == 0)
            {
                return NotFound();
            }

            List<LessonActivityGetDTO> lessonActivitiesDTO = mapper.Map<List<LessonActivityGetDTO>>(lessonActivities);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var lessonActivity in lessonActivitiesDTO)
            {
                if (!string.IsNullOrEmpty(lessonActivity.AttachmentLink) &&
                    lessonActivity.AttachmentLink.StartsWith("Uploads", StringComparison.OrdinalIgnoreCase))
                {
                    lessonActivity.AttachmentLink = $"{serverUrl}{lessonActivity.AttachmentLink.Replace("\\", "/")}";
                }
            }

            return Ok(lessonActivitiesDTO);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetByWeekID/{SubjectId}/{WeekId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "student" },
            pages: new[] { "Lesson Activity" }
        )]
        public async Task<IActionResult> GetByWeekID(long SubjectId, long WeekId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var semesterWorkingWeek = Unit_Of_Work.semesterWorkingWeek_Repository
                .First_Or_Default(s => s.ID == WeekId && s.IsDeleted != true);
            if (semesterWorkingWeek == null)
                return BadRequest("No SemesterWorkingWeek with this ID");

            Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(s=>s.ID == SubjectId);
            if (subject == null)
            {
                return BadRequest("No subject with this ID");

            }
            var lessons = Unit_Of_Work.lesson_Repository
                .FindBy(d => d.IsDeleted != true && d.SemesterWorkingWeekID == WeekId);
            if (lessons == null || lessons.Count == 0)
                return NotFound("No Lesson in this SemesterWorkingWeek");

            var lessonIds = lessons.Select(s => s.ID).Distinct().ToList();

            var lessonActivities = await Unit_Of_Work.lessonActivity_Repository
                .Select_All_With_IncludesById<LessonActivity>(
                    f => f.IsDeleted != true && lessonIds.Contains(f.LessonID),
                    query => query.Include(emp => emp.LessonActivityType)
                );

            var lessonActivityTypes = Unit_Of_Work.lessonActivityType_Repository
                .FindBy(s => s.IsDeleted != true);
            if (lessonActivityTypes == null || lessonActivityTypes.Count == 0)
                return NotFound("No LessonActivityType");

            var lessonActivitiesDTO = mapper.Map<List<LessonActivityGetDTO>>(lessonActivities);
            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var item in lessonActivitiesDTO)
            {
                if (!string.IsNullOrEmpty(item.AttachmentLink) &&
                    item.AttachmentLink.StartsWith("Uploads", StringComparison.OrdinalIgnoreCase))
                {
                    item.AttachmentLink = $"{serverUrl}{item.AttachmentLink.Replace("\\", "/")}";
                }
            }

            var lessonActivitiesTypeDTO = mapper.Map<List<LessonActivityTypeGetDTO>>(lessonActivityTypes);

            // Attach Activities to their corresponding types, empty if none
            foreach (var typeDto in lessonActivitiesTypeDTO)
            {
                typeDto.Activities = lessonActivitiesDTO
                    .Where(a => a.LessonActivityTypeID == typeDto.ID)
                    .ToList();
            }

            return Ok(new
            {
                subjectName = subject.en_name,
                weekName = semesterWorkingWeek.EnglishName,
                data = lessonActivitiesTypeDTO
            });
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetById/{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Lesson Activity"}
        )]
        public async Task<IActionResult> GetById(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            LessonActivity lessonActivitie = await Unit_Of_Work.lessonActivity_Repository.FindByIncludesAsync(
                    f => f.IsDeleted != true && f.ID == id,
                    query => query.Include(emp => emp.Lesson),
                    query => query.Include(emp => emp.LessonActivityType)
                    );

            if (lessonActivitie == null)
            {
                return NotFound();
            }

            LessonActivityGetDTO lessonActivitieDTO = mapper.Map<LessonActivityGetDTO>(lessonActivitie);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            if (!string.IsNullOrEmpty(lessonActivitieDTO.AttachmentLink) &&
                lessonActivitieDTO.AttachmentLink.StartsWith("Uploads", StringComparison.OrdinalIgnoreCase))
            {
                lessonActivitieDTO.AttachmentLink = $"{serverUrl}{lessonActivitieDTO.AttachmentLink.Replace("\\", "/")}";
            } 

            return Ok(lessonActivitieDTO);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Lesson Activity" }
        )]
        public async Task<IActionResult> Add([FromForm] LessonActivityAddDTO NewLessonActivity)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (NewLessonActivity == null)
            {
                return BadRequest("Lesson Activity cannot be null");
            }
             
            Lesson lesson = Unit_Of_Work.lesson_Repository.First_Or_Default(g => g.ID == NewLessonActivity.LessonID && g.IsDeleted != true);
            if (lesson == null)
            {
                return BadRequest("No Lesson with this ID");
            } 
            
            LessonActivityType lessonActivityType = Unit_Of_Work.lessonActivityType_Repository.First_Or_Default(g => g.ID == NewLessonActivity.LessonActivityTypeID && g.IsDeleted != true);
            if (lesson == null)
            {
                return BadRequest("No Lesson Activity Type with this ID");
            }

            if (NewLessonActivity.AttachmentFile != null)
            {
                string returnFileInput = await _fileValidationService.ValidateFileWithTimeoutAsync(NewLessonActivity.AttachmentFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            } 

            LessonActivity lessonActivity = mapper.Map<LessonActivity>(NewLessonActivity);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            lessonActivity.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                lessonActivity.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                lessonActivity.InsertedByUserId = userId;
            }
             
            Unit_Of_Work.lessonActivity_Repository.Add(lessonActivity);
            Unit_Of_Work.SaveChanges();

            if (NewLessonActivity.AttachmentFile != null)
            {
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/LessonActivity");
                var lessFolder = Path.Combine(baseFolder, lessonActivity.ID.ToString());
                if (!Directory.Exists(lessFolder))
                {
                    Directory.CreateDirectory(lessFolder);
                }

                if (NewLessonActivity.AttachmentFile.Length > 0)
                {
                    var filePath = Path.Combine(lessFolder, NewLessonActivity.AttachmentFile.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await NewLessonActivity.AttachmentFile.CopyToAsync(stream);
                    }
                }

                lessonActivity.AttachmentLink = Path.Combine("Uploads", "LessonActivity", lessonActivity.ID.ToString(), NewLessonActivity.AttachmentFile.FileName);
                Unit_Of_Work.lessonActivity_Repository.Update(lessonActivity);
            }
            return Ok();
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Lesson Activity" }
        )]
        public async Task<IActionResult> Edit([FromForm] LessonActivityPutDTO EditLessonActivity)
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

            if (EditLessonActivity == null)
            {
                return BadRequest("Lesson Activity cannot be null");
            }

            Lesson lesson = Unit_Of_Work.lesson_Repository.First_Or_Default(g => g.ID == EditLessonActivity.LessonID && g.IsDeleted != true);
            if (lesson == null)
            {
                return BadRequest("No Lesson with this ID");
            }

            LessonActivityType lessonActivityType = Unit_Of_Work.lessonActivityType_Repository.First_Or_Default(g => g.ID == EditLessonActivity.LessonActivityTypeID && g.IsDeleted != true);
            if (lesson == null)
            {
                return BadRequest("No Lesson Activity Type with this ID");
            }

            LessonActivity lessonActivityExists = Unit_Of_Work.lessonActivity_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == EditLessonActivity.ID);
            if (lessonActivityExists == null)
            {
                return NotFound("No Lesson Activity with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Lesson Activity", roleId, userId, lessonActivityExists);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            if (EditLessonActivity.AttachmentFile != null)
            {
                string returnFileInput = await _fileValidationService.ValidateFileWithTimeoutAsync(EditLessonActivity.AttachmentFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            if (EditLessonActivity.AttachmentFile != null)
            {
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/LessonActivity");
                var lessFolder = Path.Combine(baseFolder, EditLessonActivity.ID.ToString());

                if (System.IO.File.Exists(lessFolder))
                {
                    System.IO.File.Delete(lessFolder); // Delete the old file
                }

                if (Directory.Exists(lessFolder))
                {
                    Directory.Delete(lessFolder, true);
                }

                if (!Directory.Exists(lessFolder))
                {
                    Directory.CreateDirectory(lessFolder);
                }

                if (EditLessonActivity.AttachmentFile.Length > 0)
                {
                    var filePath = Path.Combine(lessFolder, EditLessonActivity.AttachmentFile.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await EditLessonActivity.AttachmentFile.CopyToAsync(stream);
                    }
                }

                EditLessonActivity.AttachmentLink = Path.Combine("Uploads", "LessonActivity", lessonActivityExists.ID.ToString(), EditLessonActivity.AttachmentFile.FileName);
            }
            else
            {
                if (!string.IsNullOrEmpty(lessonActivityExists.AttachmentLink))
                {
                    if (lessonActivityExists.AttachmentLink.StartsWith("Uploads", StringComparison.OrdinalIgnoreCase))
                    {
                        var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/LessonActivity");
                        var oldLessonResourceFolder = Path.Combine(baseFolder, lessonActivityExists.ID.ToString());

                        string existingFilePath = Path.Combine(baseFolder, lessonActivityExists.ID.ToString());

                        if (System.IO.File.Exists(existingFilePath))
                        {
                            System.IO.File.Delete(existingFilePath); // Delete the old file
                        }

                        if (Directory.Exists(oldLessonResourceFolder))
                        {
                            Directory.Delete(oldLessonResourceFolder, true);
                        }
                    }
                }
            }

            mapper.Map(EditLessonActivity, lessonActivityExists);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            lessonActivityExists.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                lessonActivityExists.UpdatedByOctaId = userId;
                if (lessonActivityExists.UpdatedByUserId != null)
                {
                    lessonActivityExists.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                lessonActivityExists.UpdatedByUserId = userId;
                if (lessonActivityExists.UpdatedByOctaId != null)
                {
                    lessonActivityExists.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.lessonActivity_Repository.Update(lessonActivityExists);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Lesson Activity" }
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
                return BadRequest("Enter Lesson Activity ID");
            }

            LessonActivity lessonActivity = Unit_Of_Work.lessonActivity_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);

            if (lessonActivity == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Lesson Activity", roleId, userId, lessonActivity);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            lessonActivity.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            lessonActivity.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                lessonActivity.DeletedByOctaId = userId;
                if (lessonActivity.DeletedByUserId != null)
                {
                    lessonActivity.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                lessonActivity.DeletedByUserId = userId;
                if (lessonActivity.DeletedByOctaId != null)
                {
                    lessonActivity.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.lessonActivity_Repository.Update(lessonActivity);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
