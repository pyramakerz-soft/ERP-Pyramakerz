using AutoMapper;
using LMS_CMS_BL.DTO.SocialWorker;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.SocialWorker;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.SocialWorker
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class StudentIssueController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public StudentIssueController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
               allowedTypes: new[] { "octa", "employee" },
               pages: new[] { "Student Issues" }
               )]
        public async Task<IActionResult> Get()
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

            List<StudentIssue> studentIssue =await Unit_Of_Work.studentIssue_Repository.Select_All_With_IncludesById<StudentIssue>(t => t.IsDeleted != true && t.Student.IsDeleted != true && t.Classroom.IsDeleted != true && t.Classroom.Grade.IsDeleted != true && t.Classroom.Grade.Section.IsDeleted != true && t.Classroom.Grade.Section.school.IsDeleted != true ,
                    query => query.Include(emp => emp.Student),
                    query => query.Include(emp => emp.Classroom)
                                  .ThenInclude(c => c.Grade)
                                  .ThenInclude(g => g.Section)
                                  .ThenInclude(s => s.school),
                    query => query.Include(emp => emp.IssuesType));

            if (studentIssue == null || studentIssue.Count == 0)
            {
                return NotFound();
            }

            List<StudentIssueGetDTO> Dto = mapper.Map<List<StudentIssueGetDTO>>(studentIssue);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Student Issues" }
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

            StudentIssue studentissue = await Unit_Of_Work.studentIssue_Repository.FindByIncludesAsync(
                    t => t.IsDeleted != true && t.ID == id && t.Student.IsDeleted != true && t.Classroom.IsDeleted != true && t.Classroom.Grade.IsDeleted != true && t.Classroom.Grade.Section.IsDeleted != true && t.Classroom.Grade.Section.school.IsDeleted != true,
                    query => query.Include(emp => emp.Student),
                    query => query.Include(emp => emp.Classroom)
                                  .ThenInclude(c => c.Grade)
                                  .ThenInclude(g => g.Section)
                                  .ThenInclude(s => s.school),
                    query => query.Include(emp => emp.IssuesType));

            if (studentissue == null)
            {
                return NotFound();
            }

            StudentIssueGetDTO Dto = mapper.Map<StudentIssueGetDTO>(studentissue);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" },
         pages: new[] { "Student Issues" }
        )]
        public async Task<IActionResult> Add(StudentIssueAddDTO NewIssue)
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

            Student student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == NewIssue.StudentID && s.IsDeleted != true);
            if (student == null)
            {
                return BadRequest("There is no student with this Id");
            }

            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(s => s.ID == NewIssue.ClassroomID && s.IsDeleted != true);
            if (classroom == null)
            {
                return BadRequest("There is no classroom with this Id");
            }

            StudentIssue studentIssue = mapper.Map<StudentIssue>(NewIssue);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            studentIssue.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                studentIssue.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                studentIssue.InsertedByUserId = userId;
            }
            Unit_Of_Work.studentIssue_Repository.Add(studentIssue);
            Unit_Of_Work.SaveChanges();

            return Ok(NewIssue);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" },
         allowEdit: 1,
         pages: new[] { "Student Issues" }
        )]
        public async Task<IActionResult> EditAsync(StudentIssueEditDTO NewIssue)
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

            StudentIssue studentIssue = Unit_Of_Work.studentIssue_Repository.First_Or_Default(s => s.ID == NewIssue.ID && s.IsDeleted != true);
            if (studentIssue == null)
            {
                return BadRequest("Student Issue not exist");
            }

            Student student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == NewIssue.StudentID && s.IsDeleted != true);
            if (student == null)
            {
                return BadRequest("There is no student with this Id");
            }

            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(s => s.ID == NewIssue.ClassroomID && s.IsDeleted != true);
            if (classroom == null)
            {
                return BadRequest("There is no classroom with this Id");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Student Issues", roleId, userId, studentIssue);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(NewIssue, studentIssue);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            studentIssue.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                studentIssue.UpdatedByOctaId = userId;
                if (studentIssue.UpdatedByUserId != null)
                {
                    studentIssue.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                studentIssue.UpdatedByUserId = userId;
                if (studentIssue.UpdatedByOctaId != null)
                {
                    studentIssue.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.studentIssue_Repository.Update(studentIssue);
            Unit_Of_Work.SaveChanges();

            return Ok(NewIssue);
        }

        ////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1,
          pages: new[] { "Student Issues" }
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

            StudentIssue studentIssue = Unit_Of_Work.studentIssue_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (studentIssue == null)
            {
                return BadRequest("Student Issue not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Student Issues", roleId, userId, studentIssue);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            studentIssue.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            studentIssue.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                studentIssue.DeletedByOctaId = userId;
                if (studentIssue.DeletedByUserId != null)
                {
                    studentIssue.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                studentIssue.DeletedByUserId = userId;
                if (studentIssue.DeletedByOctaId != null)
                {
                    studentIssue.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.studentIssue_Repository.Update(studentIssue);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }

    }
}
