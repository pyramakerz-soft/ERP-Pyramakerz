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
    public class AttendanceController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public AttendanceController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////

        [HttpGet("ByAcademicYearAndClass/{AcademicYearId}/{ClassId}")]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" },
        pages: new[] { "Lesson Resources Types" }
        )]
        public async Task<IActionResult> Get(long AcademicYearId , long ClassId)
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

            List<Attendance> attendances =await Unit_Of_Work.attendance_Repository.Select_All_With_IncludesById<Attendance>(t => t.IsDeleted != true && t.AcademicYearID==AcademicYearId && t.ClassroomID== ClassId &&
                    t.AcademicYear.IsDeleted != true && t.AcademicYear.School.IsDeleted!= true && t.Classroom.IsDeleted!= true && t.Classroom.Grade.IsDeleted!= true ,
                    query => query.Include(emp => emp.AcademicYear).ThenInclude(a => a.School),
                    query => query.Include(emp => emp.Classroom).ThenInclude(a => a.Grade));

            if (attendances == null || attendances.Count == 0)
            {
                return NotFound();
            }

            List<AttendanceGetDTO> Dto = mapper.Map<List<AttendanceGetDTO>>(attendances);

            return Ok(Dto);
        }

        ////////////////////////////////
        
        [HttpGet("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Lesson Resources Types" }
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

            Attendance attendance = await Unit_Of_Work.attendance_Repository.FindByIncludesAsync(
                    t => t.IsDeleted != true && t.ID == id &&
                    t.AcademicYear.IsDeleted != true && t.AcademicYear.School.IsDeleted != true && t.Classroom.IsDeleted != true && t.Classroom.Grade.IsDeleted != true,
                    query => query.Include(emp => emp.AcademicYear).ThenInclude(a => a.School),
                    query => query.Include(emp => emp.AttendanceStudents).ThenInclude(a => a.Student),
                    query => query.Include(emp => emp.Classroom).ThenInclude(a => a.Grade));

            if (attendance == null)
            {
                return NotFound();
            }

            AttendanceGetDTO Dto = mapper.Map<AttendanceGetDTO>(attendance);
            return Ok(Dto);
        }

        ////////////////////////////////     

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Lesson Resources Types" }
        )]
        public async Task<IActionResult> Add(AttendanceAddDTO NewAttendence)
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
            if (NewAttendence == null)
            {
                return BadRequest("Conduct is empty");
            }

            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(s => s.ID == NewAttendence.ClassroomID && s.IsDeleted != true && s.Grade.IsDeleted != true);
            if (classroom == null)
            {
                return BadRequest("There is no classroom with this Id");
            }

            AcademicYear academicYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(s => s.ID == NewAttendence.AcademicYearID && s.IsDeleted != true && s.School.IsDeleted!= true);
            if (academicYear == null)
            {
                return BadRequest("There is no academicYear with this Id");
            }

            Attendance attendance = mapper.Map<Attendance>(NewAttendence);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            attendance.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                attendance.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                attendance.InsertedByUserId = userId;
            }

            Unit_Of_Work.attendance_Repository.Add(attendance);
            Unit_Of_Work.SaveChanges();

            return Ok(NewAttendence);
        }

        ////////////////////////////////    

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Lesson Resources Types" }
        )]
        public async Task<IActionResult> EditAsync(AttendanceEditDTO NewAttendence)
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

            if (NewAttendence == null)
            {
                return BadRequest("Attendence cannot be null");
            }
            if (NewAttendence.ID == null)
            {
                return BadRequest("id can not be null");
            }

            Attendance attendance = Unit_Of_Work.attendance_Repository.First_Or_Default(s => s.ID == NewAttendence.ID && s.IsDeleted != true);
            if (attendance == null)
            {
                return BadRequest("attendance not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Lesson Resources Types", roleId, userId, attendance);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            attendance.Date = NewAttendence.Date;

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            attendance.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                attendance.UpdatedByOctaId = userId;
                if (attendance.UpdatedByUserId != null)
                {
                    attendance.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                attendance.UpdatedByUserId = userId;
                if (attendance.UpdatedByOctaId != null)
                {
                    attendance.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.attendance_Repository.Update(attendance);
            Unit_Of_Work.SaveChanges();

            foreach (var item in NewAttendence.AttendanceStudents)
            {
                AttendanceStudent attendanceStudent = Unit_Of_Work.attendanceStudent_Repository.First_Or_Default(s => s.ID == item.ID && s.IsDeleted != true);
                if (attendanceStudent == null)
                {
                    return BadRequest("attendanceStudent not exist");
                }
                mapper.Map(item, attendanceStudent);

                attendanceStudent.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    attendanceStudent.UpdatedByOctaId = userId;
                    if (attendanceStudent.UpdatedByUserId != null)
                    {
                        attendanceStudent.UpdatedByUserId = null;
                    }
                }
                else if (userTypeClaim == "employee")
                {
                    attendanceStudent.UpdatedByUserId = userId;
                    if (attendanceStudent.UpdatedByOctaId != null)
                    {
                        attendanceStudent.UpdatedByOctaId = null;
                    }
                }
                Unit_Of_Work.attendanceStudent_Repository.Update(attendanceStudent);
                Unit_Of_Work.SaveChanges();

            }
            return Ok(NewAttendence);
        }


        ////////////////////////////////     

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1,
          pages: new[] { "Lesson Resources Types" }
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

            Attendance attendance = Unit_Of_Work.attendance_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (attendance == null)
            {
                return BadRequest("conduct not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Lesson Resources Types", roleId, userId, attendance);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }


            attendance.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            attendance.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                attendance.DeletedByOctaId = userId;
                if (attendance.DeletedByUserId != null)
                {
                    attendance.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                attendance.DeletedByUserId = userId;
                if (attendance.DeletedByOctaId != null)
                {
                    attendance.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.attendance_Repository.Update(attendance);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
