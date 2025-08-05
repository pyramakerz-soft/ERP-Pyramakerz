using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class RemedialClassroomStudentController : ControllerBase
    {

        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public RemedialClassroomStudentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }


        /////////////////

        [HttpPost]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" }
           ,
           pages: new[] { "Remedial Classes" }
          )]
        public async Task<IActionResult> Add(RemedialClassroomStudentAddDTO NewRemedialClass)
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
            if (NewRemedialClass == null)
            {
                return NotFound();
            }

            RemedialClassroom remedialClassroom =await Unit_Of_Work.remedialClassroom_Repository.FindByIncludesAsync(a => a.ID == NewRemedialClass.RemedialClassroomID && a.IsDeleted != true ,
                 query => query.Include(x => x.Subject),
                 query => query.Include(x => x.Subject.Grade));
            if (remedialClassroom == null)
            {
                return BadRequest("No RemedialClassroom with this id");
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            // create remedial classrooom student

            foreach (var item in NewRemedialClass.StudentIds)
            {
                StudentGrade studentGrade = Unit_Of_Work.studentGrade_Repository.First_Or_Default(s => s.StudentID == item && s.GradeID == remedialClassroom.Subject.GradeID && s.IsDeleted != true);
                if (studentGrade != null)
                {
                    RemedialClassroomStudent remedialClassroomStudent = new RemedialClassroomStudent();
                    remedialClassroomStudent.StudentID = item;
                    remedialClassroomStudent.RemedialClassroomID = remedialClassroom.ID;
                    remedialClassroomStudent.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        remedialClassroomStudent.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        remedialClassroomStudent.InsertedByUserId = userId;
                    }
                    Unit_Of_Work.remedialClassroomStudent_Repository.Add(remedialClassroomStudent);
                    Unit_Of_Work.SaveChanges();
                }

            }
            return Ok(NewRemedialClass);
        }

        /////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" }
          ,
          allowDelete: 1,
          pages: new[] { "Remedial Classes" }
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
            RemedialClassroomStudent remedialClassroom = Unit_Of_Work.remedialClassroomStudent_Repository.Select_By_Id(id);

            if (remedialClassroom == null || remedialClassroom.IsDeleted == true)
            {
                return NotFound("No Remedial Classroom with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Remedial Classes", roleId, userId, remedialClassroom);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            remedialClassroom.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            remedialClassroom.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                remedialClassroom.DeletedByOctaId = userId;
                if (remedialClassroom.DeletedByUserId != null)
                {
                    remedialClassroom.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                remedialClassroom.DeletedByUserId = userId;
                if (remedialClassroom.DeletedByOctaId != null)
                {
                    remedialClassroom.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.remedialClassroomStudent_Repository.Update(remedialClassroom);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
