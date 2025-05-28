using AutoMapper;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.DTO.Registration;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;
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
    public class ClassroomStudentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public ClassroomStudentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        [HttpGet("GetByClassroom/{classId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Classroom Students" }
        )]
        public async Task<IActionResult> GetAsync(long classId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == classId);
            if(classroom == null)
            {
                return NotFound("No Classroom with this ID");
            }

            List<StudentClassroom> studentClassrooms = await Unit_Of_Work.studentClassroom_Repository.Select_All_With_IncludesById<StudentClassroom>(
                    f => f.IsDeleted != true && f.ClassID == classId,
                    query => query.Include(emp => emp.Student),
                    query => query.Include(emp => emp.Classroom));

            if (studentClassrooms == null || studentClassrooms.Count == 0)
            {
                return NotFound();
            }

            List<StudentClassroomGetDTO> studentClassroomsDTO = mapper.Map<List<StudentClassroomGetDTO>>(studentClassrooms);

            return Ok(studentClassroomsDTO);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee" },
             pages: new[] { "Classroom Students" }
        )]
        public IActionResult Add(StudentClassroomAddDTO newStudentClassroom)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (newStudentClassroom == null)
            {
                return BadRequest("Student Classroom cannot be null");
            }

            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(s => s.ID == newStudentClassroom.ClassID && s.IsDeleted != true);
            if (classroom == null)
            {
                return BadRequest("this Classroom is not exist");
            }
            
            Student student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == newStudentClassroom.StudentID && s.IsDeleted != true);
            if (student == null)
            {
                return BadRequest("this Student is not exist");
            }

            StudentClassroom studentClassroom = mapper.Map<StudentClassroom>(newStudentClassroom);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            studentClassroom.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                studentClassroom.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                studentClassroom.InsertedByUserId = userId;
            }

            Unit_Of_Work.studentClassroom_Repository.Add(studentClassroom);
            Unit_Of_Work.SaveChanges();
            return Ok(newStudentClassroom);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut("TransferFromClassToClass")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowEdit: 1,
          pages: new[] { "Classroom Students" }
        )]
        public IActionResult Edit(StudentClassroomPutDTO editStudentClassroom)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID, Type claim not found.");
            }

            if (editStudentClassroom == null)
            {
                return BadRequest("Student Classroom be null");
            }

            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(s => s.ID == editStudentClassroom.ClassID && s.IsDeleted != true);
            if (classroom == null)
            {
                return BadRequest("this Classroom is not exist");
            }

            Student student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == editStudentClassroom.StudentID && s.IsDeleted != true);
            if (student == null)
            {
                return BadRequest("this Student is not exist");
            }
            
            StudentClassroom studentClassroom= Unit_Of_Work.studentClassroom_Repository.First_Or_Default(s => s.ID == editStudentClassroom.ID && s.IsDeleted != true);
            if (student == null)
            {
                return BadRequest("this Student Classroom is not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Classroom Students", roleId, userId, studentClassroom);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            if(studentClassroom.Classroom.GradeID != classroom.GradeID)
            {
                return BadRequest("Classrooms Are not at the Same Grade");
            }

            mapper.Map(editStudentClassroom, studentClassroom);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            studentClassroom.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                studentClassroom.UpdatedByOctaId = userId;
                if (studentClassroom.UpdatedByUserId != null)
                {
                    studentClassroom.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                studentClassroom.UpdatedByUserId = userId;
                if (studentClassroom.UpdatedByOctaId != null)
                {
                    studentClassroom.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.studentClassroom_Repository.Update(studentClassroom);
            Unit_Of_Work.SaveChanges();
            return Ok(editStudentClassroom);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Classroom Students" }
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
                return BadRequest("Enter Student Class ID");
            }

            StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == id);
            if (studentClassroom == null)
            {
                return NotFound("No Student Classroom with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Classroom Students", roleId, userId, studentClassroom);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            studentClassroom.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            studentClassroom.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                studentClassroom.DeletedByOctaId = userId;
                if (studentClassroom.DeletedByUserId != null)
                {
                    studentClassroom.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                studentClassroom.DeletedByUserId = userId;
                if (studentClassroom.DeletedByOctaId != null)
                {
                    studentClassroom.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.studentClassroom_Repository.Update(studentClassroom);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
