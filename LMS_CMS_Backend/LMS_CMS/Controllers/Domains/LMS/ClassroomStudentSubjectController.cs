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
    public class ClassroomStudentSubjectController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public ClassroomStudentSubjectController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        [HttpPut("IsSubjectHide")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Classroom Students" }
        )]
        public IActionResult IsSubjectHide(StudentClassroomSubjectHidePutDTO EditedStudentClassroomSubjectHide)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID, Type claim not found.");
            }

            if (EditedStudentClassroomSubjectHide == null)
            {
                return BadRequest("Student Classroom Subject cannot be null");
            }

            StudentClassroomSubject StudentClassroomSubjectExists = Unit_Of_Work.studentClassroomSubject_Repository.First_Or_Default(
                g => g.ID == EditedStudentClassroomSubjectHide.ID && g.IsDeleted != true
                );
            if (StudentClassroomSubjectExists == null)
            {
                return NotFound("No Student Classroom Subject with this ID");
            } 

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Classroom Students", roleId, userId, StudentClassroomSubjectExists);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(EditedStudentClassroomSubjectHide, StudentClassroomSubjectExists);

            StudentClassroomSubjectExists.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                StudentClassroomSubjectExists.UpdatedByOctaId = userId;
                if (StudentClassroomSubjectExists.UpdatedByUserId != null)
                {
                    StudentClassroomSubjectExists.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                StudentClassroomSubjectExists.UpdatedByUserId = userId;
                if (StudentClassroomSubjectExists.UpdatedByOctaId != null)
                {
                    StudentClassroomSubjectExists.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.studentClassroomSubject_Repository.Update(StudentClassroomSubjectExists);
            Unit_Of_Work.SaveChanges();

            return Ok();
        }
    }
}
