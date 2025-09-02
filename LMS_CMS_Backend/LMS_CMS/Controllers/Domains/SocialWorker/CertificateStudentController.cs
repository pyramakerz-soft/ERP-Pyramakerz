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
    public class CertificateStudentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public CertificateStudentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }


        ////////////////////////////


        [HttpGet("GetByStudentId/{StudentId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Add Certificate To Student" }
        )]
        public async Task<IActionResult> GetByStudentId(long StudentId)
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

            List<CertificateStudent> types = await Unit_Of_Work.certificateStudent_Repository.Select_All_With_IncludesById<CertificateStudent>(
                    sem => sem.IsDeleted != true && sem.StudentID == StudentId,
                     query => query.Include(emp => emp.Student),
                     query => query.Include(emp => emp.InsertedByEmployee),
                    query => query.Include(emp => emp.CertificateType));

            if (types == null || types.Count == 0)
            {
                return NotFound();
            }

            List<CertificateTypeStudentGet> Dto = mapper.Map<List<CertificateTypeStudentGet>>(types);
            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var item in Dto)
            {
                if (!string.IsNullOrEmpty(item.CertificateTypeFile))
                {
                    item.CertificateTypeFile = $"{serverUrl}{item.CertificateTypeFile.Replace("\\", "/")}";
                }
            }
            return Ok(Dto);
        }

        ////////////////////////////


        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Add Certificate To Student" }
         )]
        public async Task<IActionResult> Add(CertificateTypeStudentAddDTO type)
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

            Student stu = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == type.StudentID && s.IsDeleted != true);
            if (stu == null)
            {
                return BadRequest("student id not exist");
            }

            CertificateType s = Unit_Of_Work.certificateType_Repository.First_Or_Default(s => s.ID == type.CertificateTypeID && s.IsDeleted != true);
            if (s == null)
            {
                return BadRequest("CertificateType id not exist");
            }
            CertificateStudent Type = mapper.Map<CertificateStudent>(type);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            Type.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                Type.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                Type.InsertedByUserId = userId;
            }
            Unit_Of_Work.certificateStudent_Repository.Add(Type);

            Unit_Of_Work.SaveChanges();
            return Ok(type);
        }

        ////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1,
          pages: new[] { "Add Certificate To Student" }
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

            CertificateStudent medal = Unit_Of_Work.certificateStudent_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (medal == null)
            {
                return BadRequest("Certificate Student not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Add Certificate To Student", roleId, userId, medal);
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
            Unit_Of_Work.certificateStudent_Repository.Update(medal);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
        ////////////////////////////////////////////////////////////////////////////////////////////--77
        [HttpGet("CertificateToStudentReport")]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" },
        pages: new[] { "Add Certificate To Student" }
         )]
        public async Task<IActionResult> CertificateToStudentReport(
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

            if (!SchoolId.HasValue || !GradeId.HasValue || !ClassroomId.HasValue || !StudentId.HasValue)
            {
                return BadRequest("School, Grade, Classroom, and Student are all required.");
            }

            IQueryable<CertificateStudent> query = Unit_Of_Work.certificateStudent_Repository.Query()
                .Where(cs => cs.IsDeleted != true && cs.Student.IsDeleted != true)
                .Join(Unit_Of_Work.studentClassroom_Repository.Query(),
                    cs => cs.StudentID,
                    sc => sc.StudentID,
                    (cs, sc) => new { CertificateStudent = cs, StudentClassroom = sc })
                .Where(jo => jo.StudentClassroom.IsDeleted != true
                    && jo.StudentClassroom.ClassID == ClassroomId.Value
                    && jo.StudentClassroom.Classroom.GradeID == GradeId.Value
                    && jo.StudentClassroom.Classroom.Grade.IsDeleted != true
                    && jo.StudentClassroom.Classroom.Grade.Section.IsDeleted != true
                    && jo.StudentClassroom.Classroom.Grade.Section.school.IsDeleted != true
                    && jo.StudentClassroom.Classroom.Grade.Section.school.ID == SchoolId.Value
                    && jo.CertificateStudent.StudentID == StudentId.Value)
                .Select(j => j.CertificateStudent);

            var certificateStudents = await query
                .Include(cs => cs.Student)
                .Include(cs => cs.CertificateType)
                .Include(cs => cs.InsertedByEmployee)
                .OrderBy(cs => cs.InsertedAt)
                .ToListAsync();

            if (certificateStudents == null || certificateStudents.Count == 0)
            {
                return NotFound("No certificate records found for the specified criteria.");
            }

            var reportData = mapper.Map<List<CertificateStudentReportDTO>>(certificateStudents);

            return Ok(reportData);
        }


    }
}
