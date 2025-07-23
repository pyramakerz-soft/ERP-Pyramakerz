using LMS_CMS_PL.Attribute;
using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using LMS_CMS_PL.Services;
using AutoMapper;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_BL.DTO;
using LMS_CMS_BL.DTO.LMS;
using static System.Runtime.InteropServices.JavaScript.JSType;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class DutyController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public DutyController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////


        [HttpGet]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" }
        //,
        //pages: new[] { "Academic Years" }
        )]
        public async Task<IActionResult> Get(DateOnly date)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            List<Duty> duty = await Unit_Of_Work.duty_Repository.Select_All_With_IncludesById<Duty>(d => d.IsDeleted != true && d.Date == date && d.TimeTableSession.TimeTableClassroom.TimeTable.IsFavourite == true && d.TimeTableSession.TimeTableClassroom.TimeTable.IsDeleted != true ,
                    query => query.Include(a => a.Teacher),
                    query => query.Include(a => a.TimeTableSession.TimeTableClassroom.Classroom));

            List<DutyGetDto> DTo = mapper.Map<List<DutyGetDto>>(duty);

            return Ok(DTo);
        }

        /////////////////


        [HttpGet("{id}")]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" }
        //,
        //pages: new[] { "Academic Years" }
        )]
        public async Task<IActionResult> GetById(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

           Duty duty = await Unit_Of_Work.duty_Repository.FindByIncludesAsync(d => d.IsDeleted != true && d.ID == id && d.TimeTableSession.TimeTableClassroom.TimeTable.IsFavourite == true && d.TimeTableSession.TimeTableClassroom.TimeTable.IsDeleted != true,
                    query => query.Include(a => a.Teacher),
                    query => query.Include(a => a.TimeTableSession.TimeTableClassroom.Classroom.AcademicYear.School),
                    query => query.Include(a => a.TimeTableSession.TimeTableClassroom.Classroom));

            DutyGetDto DTo = mapper.Map<DutyGetDto>(duty);

            return Ok(DTo);
        }

        /////////////////

        [HttpGet("GetAllTeachersValidForSessionTime")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" }
           //,
           //pages: new[] { "Academic Years" }
       )]
        public IActionResult Get(DateOnly date , int period)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            var dayOfWeek = date.DayOfWeek; // returns DayOfWeek enum (e.g. Monday, Tuesday...)

            int dayId = dayOfWeek switch
            {
                DayOfWeek.Monday => 1,
                DayOfWeek.Tuesday => 2,
                DayOfWeek.Wednesday => 3,
                DayOfWeek.Thursday => 4,
                DayOfWeek.Friday => 5,
                DayOfWeek.Saturday => 6,
                DayOfWeek.Sunday => 7,
                _ => 0
            };

            if (dayId == 0)
                return BadRequest("Invalid day of week.");

            List<TimeTableSubject> timeTableSubjects = Unit_Of_Work.timeTableSubject_Repository.FindBy(s => s.TimeTableSession.PeriodIndex == period && s.TimeTableSession.TimeTableClassroom.DayId == dayId && s.IsDeleted!= true && s.TimeTableSession.TimeTableClassroom.TimeTable.IsFavourite==true);
            List<long?> teachersNotValid = timeTableSubjects.Where(s => s.TeacherID != null).Select(s => s.TeacherID).Distinct().ToList();

            // Get all employees (teachers) excluding the ones already assigned
            List<Employee> validTeachers = Unit_Of_Work.employee_Repository.FindBy( e => e.IsDeleted != true
                    && (teachersNotValid == null || !teachersNotValid.Contains(e.ID)));

            List<Employee_GetDTO> EmployeesDTO = mapper.Map<List<Employee_GetDTO>>(validTeachers);

            return Ok(EmployeesDTO);
        }

        /////////////////

        [HttpGet("GetPeriods")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" }
           //,
           //pages: new[] { "Academic Years" }
       )]
        public IActionResult GetPeriods(DateOnly date, long ClassId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            var dayOfWeek = date.DayOfWeek; // returns DayOfWeek enum (e.g. Monday, Tuesday...)

            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(c=>c.ID==ClassId && c.IsDeleted!= true);
            if (classroom == null)
            {
                return BadRequest("no classroom with this id.");
            }

            Grade grade = Unit_Of_Work.grade_Repository.First_Or_Default(g=>g.ID==classroom.GradeID && g.IsDeleted != true);
            if (grade == null)
            {
                return BadRequest("no grade with this id.");
            }

            // Determine period count based on day of week
            int periodCount = dayOfWeek switch
            {
                DayOfWeek.Monday => grade.MON ?? 0,
                DayOfWeek.Tuesday => grade.TUS ?? 0,
                DayOfWeek.Wednesday => grade.WED ?? 0,
                DayOfWeek.Thursday => grade.THRU ?? 0,
                DayOfWeek.Friday => grade.FRI ?? 0,
                DayOfWeek.Saturday => grade.SAT ?? 0,
                DayOfWeek.Sunday => grade.SUN ?? 0,
                _ => 0
            };

            return Ok(periodCount);
        }

        /////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" }
              //,
              //pages: new[] { "Academic Years" }
          )]
        public async Task<IActionResult> Add(DutyAddDto NewDuty)
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
            if (NewDuty == null)
            {
                return BadRequest("NewDuty can not be null");
            }

            Classroom classroom =Unit_Of_Work.classroom_Repository.First_Or_Default(c=>c.ID==NewDuty.ClassID && c.IsDeleted!= true);
            if (classroom == null)
            {
                return BadRequest(" No Classroom With This Id");
            }
            var dayOfWeek = NewDuty.Date.DayOfWeek; // returns DayOfWeek enum (e.g. Monday, Tuesday...)

            int dayId = dayOfWeek switch
            {
                DayOfWeek.Monday => 1,
                DayOfWeek.Tuesday => 2,
                DayOfWeek.Wednesday => 3,
                DayOfWeek.Thursday => 4,
                DayOfWeek.Friday => 5,
                DayOfWeek.Saturday => 6,
                DayOfWeek.Sunday => 7,
                _ => 0
            };

            if (dayId == 0)
                return BadRequest("Invalid day of week.");

            TimeTableSession timeTableSession = Unit_Of_Work.timeTableSession_Repository.First_Or_Default(s => s.TimeTableClassroom.ClassroomID == NewDuty.ClassID && s.TimeTableClassroom.TimeTable.IsFavourite == true && s.TimeTableClassroom.TimeTable.IsDeleted != true && s.PeriodIndex == NewDuty.Period && s.TimeTableClassroom.DayId == dayId);
            if (timeTableSession == null)
            {
                return BadRequest(" No timeTableSession With This Id"+dayId);
            }

            Duty duty = mapper.Map<Duty>(NewDuty);
            duty.TimeTableSessionID = timeTableSession.ID;

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            duty.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                duty.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                duty.InsertedByUserId = userId;
            }

         
            Unit_Of_Work.duty_Repository.Add(duty);
            Unit_Of_Work.SaveChanges();
            return Ok(NewDuty);
        }

        /////////////////
        
        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1
            //,
            //pages: new[] { "Academic Years" }
        )]
        public IActionResult Edit(DutyEditDTO NewDuty)
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
            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(c => c.ID == NewDuty.ClassID && c.IsDeleted != true);
            if (classroom == null)
            {
                return BadRequest(" No Classroom With This Id");
            }
            var dayOfWeek = NewDuty.Date.DayOfWeek; // returns DayOfWeek enum (e.g. Monday, Tuesday...)

            int dayId = dayOfWeek switch
            {
                DayOfWeek.Monday => 1,
                DayOfWeek.Tuesday => 2,
                DayOfWeek.Wednesday => 3,
                DayOfWeek.Thursday => 4,
                DayOfWeek.Friday => 5,
                DayOfWeek.Saturday => 6,
                DayOfWeek.Sunday => 7,
                _ => 0
            };

            if (dayId == 0)
                return BadRequest("Invalid day of week.");

            TimeTableSession timeTableSession = Unit_Of_Work.timeTableSession_Repository.First_Or_Default(s => s.TimeTableClassroom.ClassroomID == NewDuty.ClassID && s.TimeTableClassroom.TimeTable.IsFavourite == true && s.TimeTableClassroom.TimeTable.IsDeleted != true && s.PeriodIndex == NewDuty.Period && s.TimeTableClassroom.DayId == dayId);
            if (timeTableSession == null)
            {
                return BadRequest(" No timeTableSession With This Id" + dayId);
            }
            Duty duty = Unit_Of_Work.duty_Repository.First_Or_Default(a => a.ID == NewDuty.ID);
            if (duty == null)
            {
                return BadRequest("this duty doesn't exist");
            }

            //if (userTypeClaim == "employee")
            //{
            //    IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Academic Years", roleId, userId, AcademicYear);
            //    if (accessCheck != null)
            //    {
            //        return accessCheck;
            //    }
            //}

            mapper.Map(NewDuty, duty);
            duty.TimeTableSessionID = timeTableSession.ID;

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            duty.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                duty.UpdatedByOctaId = userId;
                if (duty.UpdatedByUserId != null)
                {
                    duty.UpdatedByUserId = null;
                }

            }
            else if (userTypeClaim == "employee")
            {
                duty.UpdatedByUserId = userId;
                if (duty.UpdatedByOctaId != null)
                {
                    duty.UpdatedByOctaId = null;
                }
            }

          
            Unit_Of_Work.duty_Repository.Update(duty);
            Unit_Of_Work.SaveChanges();
            return Ok(NewDuty);

        }

        /////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee" }
             //,
             //allowDelete: 1,
             //pages: new[] { "Academic Years" }
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
            Duty duty = Unit_Of_Work.duty_Repository.Select_By_Id(id);

            if (duty == null || duty.IsDeleted == true)
            {
                return NotFound("No Duty with this ID");
            }

            //if (userTypeClaim == "employee")
            //{
            //    IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Academic Years", roleId, userId, academicYear);
            //    if (accessCheck != null)
            //    {
            //        return accessCheck;
            //    }
            //}

            duty.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            duty.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                duty.DeletedByOctaId = userId;
                if (duty.DeletedByUserId != null)
                {
                    duty.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                duty.DeletedByUserId = userId;
                if (duty.DeletedByOctaId != null)
                {
                    duty.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.duty_Repository.Update(duty);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
