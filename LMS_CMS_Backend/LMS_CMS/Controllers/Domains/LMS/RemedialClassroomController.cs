using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.ViolationModule;
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
    public class RemedialClassroomController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public RemedialClassroomController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////

        [HttpGet("BySchoolId/{SchoolId}")]
        [Authorize_Endpoint_(
              allowedTypes: new[] { "octa", "employee" } ,
               pages: new[] { "Remedial Classes" }
          )]
        public async Task<IActionResult> GetAsync(long SchoolId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            School school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == SchoolId & s.IsDeleted != true);
            if (school == null)
            {
                return BadRequest("No school with this ID");
            }

            AcademicYear academicYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(a => a.SchoolID == SchoolId & a.IsDeleted != true && a.IsActive == true);
            if (academicYear == null)
            {
                return BadRequest("No active academic year in this school");
            }
            List<RemedialClassroom> RemedialClassroom =await Unit_Of_Work.remedialClassroom_Repository.Select_All_With_IncludesById<RemedialClassroom>(t => t.IsDeleted != true && t.AcademicYearID == academicYear.ID ,
                    query => query.Include(x => x.Subject),
                    query => query.Include(x => x.Subject.Grade),
                    query => query.Include(x => x.Teacher),
                    query => query.Include(x => x.AcademicYear.School),
                    query => query.Include(emp => emp.AcademicYear));

            if (RemedialClassroom == null)
            {
                return NotFound();
            }
            List<RemedialClassRoomGetDTO> Dto = mapper.Map<List<RemedialClassRoomGetDTO>>(RemedialClassroom);

            return Ok(Dto);
        }

        /////////////////

        [HttpGet("ByGradeId/{gradeId}")]
        [Authorize_Endpoint_(
              allowedTypes: new[] { "octa", "employee" },
               pages: new[] { "Remedial Classes" }
          )]
        public async Task<IActionResult> GetByGradeIdAsync(long gradeId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            Grade grade = Unit_Of_Work.grade_Repository.First_Or_Default(s => s.ID == gradeId & s.IsDeleted != true);
            if (grade == null)
            {
                return BadRequest("No Grade with this ID");
            }

            List<RemedialClassroom> RemedialClassroom = await Unit_Of_Work.remedialClassroom_Repository.Select_All_With_IncludesById<RemedialClassroom>(t => t.IsDeleted != true && t.Subject.GradeID == gradeId,
                    query => query.Include(x => x.Subject),
                    query => query.Include(x => x.Subject.Grade),
                    query => query.Include(x => x.Teacher),
                    query => query.Include(x => x.AcademicYear.School),
                    query => query.Include(emp => emp.AcademicYear));

            if (RemedialClassroom == null)
            {
                return NotFound();
            }
            List<RemedialClassRoomGetDTO> Dto = mapper.Map<List<RemedialClassRoomGetDTO>>(RemedialClassroom);

            return Ok(Dto);
        }

        /////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee" },
              pages: new[] { "Remedial Classes" }
         )]
        public async Task<IActionResult> GetById(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            RemedialClassroom RemedialClassroom = await Unit_Of_Work.remedialClassroom_Repository.FindByIncludesAsync(t => t.IsDeleted != true && t.ID == id ,
                    query => query.Include(x => x.Subject),
                    query => query.Include(x => x.Subject.Grade),
                    query => query.Include(x => x.Teacher),
                    query => query.Include(x => x.RemedialClassroomStudents).ThenInclude(s => s.Student) ,
                    query => query.Include(x => x.AcademicYear.School),
                    query => query.Include(emp => emp.AcademicYear));

            if (RemedialClassroom == null)
            {
                return NotFound();
            }
            RemedialClassroom.RemedialClassroomStudents = RemedialClassroom.RemedialClassroomStudents.Where(s => s.IsDeleted != true).ToList();

            RemedialClassRoomGetDTO Dto = mapper.Map<RemedialClassRoomGetDTO>(RemedialClassroom);

            return Ok(Dto);
        }

        /////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Remedial Classes" }
         )]
        public async Task<IActionResult> Add(RemedialClassroomAddDTO NewRemedialClass)
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

            AcademicYear academicYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(s => s.ID == NewRemedialClass.AcademicYearID && s.IsDeleted != true);
            if (academicYear == null)
            {
                return NotFound("there is no academicYear with this id");
            }

            Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(s => s.ID == NewRemedialClass.SubjectID && s.IsDeleted != true);
            if (subject == null)
            {
                return NotFound("there is no subject with this id");
            }

            Employee Teacher = Unit_Of_Work.employee_Repository.First_Or_Default(s => s.ID == NewRemedialClass.TeacherID && s.IsDeleted != true);
            if (Teacher == null)
            {
                return NotFound("there is no Teacher with this id");
            }

            RemedialClassroom remedialClassroom = mapper.Map<RemedialClassroom>(NewRemedialClass);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            remedialClassroom.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                remedialClassroom.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                remedialClassroom.InsertedByUserId = userId;
            }

            Unit_Of_Work.remedialClassroom_Repository.Add(remedialClassroom);
            Unit_Of_Work.SaveChanges();

            return Ok(NewRemedialClass);
        }

        /////////////////

        [HttpPut]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" },
         allowEdit: 1,
         pages: new[] { "Remedial Classes" }
       )]
        public async Task<IActionResult> EditAsync(RemedialClassroomEditDTOcs NewRemedialClass)
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

            if (NewRemedialClass == null)
            {
                return BadRequest("RemedialClass cannot be null");
            }
            AcademicYear academicYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(s => s.ID == NewRemedialClass.AcademicYearID && s.IsDeleted != true);
            if (academicYear == null)
            {
                return NotFound("there is no academicYear with this id");
            }

            Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(s => s.ID == NewRemedialClass.SubjectID && s.IsDeleted != true);
            if (subject == null)
            {
                return NotFound("there is no subject with this id");
            }

            Employee Teacher = Unit_Of_Work.employee_Repository.First_Or_Default(s => s.ID == NewRemedialClass.TeacherID && s.IsDeleted != true);
            if (Teacher == null)
            {
                return NotFound("there is no Teacher with this id");
            }

            RemedialClassroom remedialClassroom = Unit_Of_Work.remedialClassroom_Repository.First_Or_Default(s => s.ID == NewRemedialClass.ID && s.IsDeleted != true);
            if (remedialClassroom == null)
            {
                return NotFound("there is no remedialClassroom with this id");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Remedial Classes", roleId, userId, remedialClassroom);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(NewRemedialClass, remedialClassroom);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            remedialClassroom.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                remedialClassroom.UpdatedByOctaId = userId;
                if (remedialClassroom.UpdatedByUserId != null)
                {
                    remedialClassroom.UpdatedByUserId = null;
                }

            }
            else if (userTypeClaim == "employee")
            {
                remedialClassroom.UpdatedByUserId = userId;
                if (remedialClassroom.UpdatedByOctaId != null)
                {
                    remedialClassroom.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.remedialClassroom_Repository.Update(remedialClassroom);
            Unit_Of_Work.SaveChanges();

            // edit students 

            List<RemedialClassroomStudent> remedialClassroomStudents = await Unit_Of_Work.remedialClassroomStudent_Repository
              .Select_All_With_IncludesById<RemedialClassroomStudent>(e => e.RemedialClassroomID == NewRemedialClass.ID && e.IsDeleted != true,
              query => query.Include(emp => emp.Student));

            List<long> existedStudentIds = remedialClassroomStudents.Select(d => d.StudentID).Where(id => id > 0).ToList();
            List<long> updatedStudentIds = NewRemedialClass.StudentsId?.ToList() ?? new();

            var deletedStudentIds = existedStudentIds.Except(updatedStudentIds).ToList();
            var newStudentIds = updatedStudentIds.Except(existedStudentIds).ToList();

            // Delete removed employee type relations
            foreach (var deletedId in deletedStudentIds)
            {
                var relation = remedialClassroomStudents.FirstOrDefault(r => r.StudentID == deletedId);
                if (relation != null)
                {
                    relation.IsDeleted = true;
                    Unit_Of_Work.remedialClassroomStudent_Repository.Update(relation);
                }
            }

            // Add new employee type relations
            foreach (var newId in newStudentIds)
            {
                RemedialClassroomStudent newRelation = new()
                {
                    RemedialClassroomID = remedialClassroom.ID,
                    StudentID = newId
                };
                Unit_Of_Work.remedialClassroomStudent_Repository.Add(newRelation);
            }

            await Unit_Of_Work.SaveChangesAsync();

            return Ok(NewRemedialClass);

        }
        /////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
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
            RemedialClassroom remedialClassroom = Unit_Of_Work.remedialClassroom_Repository.Select_By_Id(id);

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

            Unit_Of_Work.remedialClassroom_Repository.Update(remedialClassroom);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
