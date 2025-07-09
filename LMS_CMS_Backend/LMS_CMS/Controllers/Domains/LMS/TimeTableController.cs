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
    public class TimeTableController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public TimeTableController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////

        [HttpPost]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" })]
        public async Task<IActionResult> GenerateAsync(long SchoolId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            School school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == SchoolId && s.IsDeleted != true);
            if (school == null)
                return BadRequest("No School With This Id");

            AcademicYear academicYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(a =>a.SchoolID == SchoolId && a.IsDeleted != true && a.IsActive == true);
            if (academicYear == null)
                return BadRequest("There is no active academic year in this school");

            /////////////////////// Create the timetable
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            TimeTable timeTable = new TimeTable
            {
                AcademicYearID = academicYear.ID,
                InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone)
            };
            if (userTypeClaim == "octa")
                timeTable.InsertedByOctaId = userId;
            else if (userTypeClaim == "employee")
                timeTable.InsertedByUserId = userId;

            Unit_Of_Work.timeTable_Repository.Add(timeTable);
            Unit_Of_Work.SaveChanges();

            /////////////////////// Create the TimeTableClassroom
            // Get Grades and Classrooms
            List<Grade> Grades = await Unit_Of_Work.grade_Repository.Select_All_With_IncludesById<Grade>(g => g.IsDeleted != true && g.Section.SchoolID == SchoolId,
                query => query.Include(g => g.Section));

            if (Grades == null || Grades.Count == 0)
                return BadRequest("There is no grades in this school");

            List<long> gradesIds = Grades.Select(g => g.ID).ToList();
            List<Classroom> classes = Unit_Of_Work.classroom_Repository.FindBy(c => gradesIds.Contains(c.GradeID) && c.AcademicYearID == academicYear.ID);

            // Determine valid days based on start/end
            List<Days> allDays = Unit_Of_Work.days_Repository.Select_All().OrderBy(d => d.ID).ToList();
            List<Days> days = new List<Days>();

            if (school.WeekStartDayID <= school.WeekEndDayID)
            {
                days = allDays.Where(d => d.ID >= school.WeekStartDayID && d.ID <= school.WeekEndDayID).ToList();
            }
            else
            {
                days = allDays.Where(d => d.ID >= school.WeekStartDayID || d.ID <= school.WeekEndDayID).ToList();
            }

            // Create TimeTableClassroom combinations
            List<TimeTableClassroom> timeTableClassrooms = new List<TimeTableClassroom>();
            foreach (var classroom in classes)
            {
                foreach (var day in days)
                {
                    timeTableClassrooms.Add(new TimeTableClassroom
                    {
                        ClassroomID = classroom.ID,
                        DayId = day.ID,
                        TimeTableID = timeTable.ID,
                        InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                        InsertedByOctaId = userTypeClaim == "octa" ? userId : null,
                        InsertedByUserId = userTypeClaim == "employee" ? userId : null
                    });
                }
            }
            Unit_Of_Work.timeTableClassroom_Repository.AddRange(timeTableClassrooms);
            Unit_Of_Work.SaveChanges();

            /////////////////////// Create the TimeTableSession
            // 4. Map DayId to Grade property
            Dictionary<long, Func<Grade, int>> dayToPeriodCount = new Dictionary<long, Func<Grade, int>>
            {
                { 1, g => g.MON ?? 0 },
                { 2, g => g.TUS ?? 0 },
                { 3, g => g.WED ?? 0 },
                { 4, g => g.THRU ?? 0 },
                { 5, g => g.FRI ?? 0 },
                { 6, g => g.SAT ?? 0 },
                { 7, g => g.SUN ?? 0 }
            };

            List<TimeTableSession> sessions = new List<TimeTableSession>();
            foreach (TimeTableClassroom ttClassroom in timeTableClassrooms)
            {

                int sessionCount = dayToPeriodCount[ttClassroom.DayId.Value](ttClassroom.Classroom.Grade);

                for (int i = 0; i < sessionCount; i++)
                {
                    TimeTableSession session = new TimeTableSession
                    {
                        TimeTableClassroomID = ttClassroom.ID,
                        InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                        InsertedByOctaId = userTypeClaim == "octa" ? userId : null,
                        InsertedByUserId = userTypeClaim == "employee" ? userId : null
                    };
                    sessions.Add(session);
                }
            }

            Unit_Of_Work.timeTableSession_Repository.AddRange(sessions);
            Unit_Of_Work.SaveChanges();

            /////////////////////// Create the TimeTableSession
            foreach (var session in sessions)
            {
                List<ClassroomSubject> classroomSubject = Unit_Of_Work.classroomSubject_Repository.FindBy(s => s.ClassroomID == session.TimeTableClassroom.ClassroomID);
                
            }

            return Ok();
        }

    }
}
