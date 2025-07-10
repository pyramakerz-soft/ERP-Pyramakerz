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
        public async Task<IActionResult> GenerateAsync(TimeTableAddDTO timeTableAddDTO)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            School school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == timeTableAddDTO.SchoolID && s.IsDeleted != true);
            if (school == null)
                return BadRequest("No School With This Id");

            AcademicYear academicYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(a =>a.SchoolID == timeTableAddDTO.SchoolID && a.IsDeleted != true && a.IsActive == true);
            if (academicYear == null)
                return BadRequest("There is no active academic year in this school");

            /////////////////////// Create the timetable
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            TimeTable timeTable = new TimeTable
            {
                AcademicYearID = academicYear.ID,
                Name= timeTableAddDTO.name,
                IsFavourite = timeTableAddDTO.IsFavourite,
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
            List<Grade> Grades = await Unit_Of_Work.grade_Repository.Select_All_With_IncludesById<Grade>(g => g.IsDeleted != true && g.Section.SchoolID == timeTableAddDTO.SchoolID,
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
            
            Random rng = new Random();
            List<TimeTableSubject> timeTableSubjects = new List<TimeTableSubject>();
            // Group sessions by classroom
            var sessionsGroupedByClassroom = sessions.GroupBy(s => s.TimeTableClassroom.ClassroomID).ToDictionary(g => g.Key, g => g.ToList());
            foreach (var kvp in sessionsGroupedByClassroom)
            {
                long classroomId = kvp.Key;
                List<TimeTableSession> classSessions = kvp.Value;

                // Group sessions by day
                var sessionsByDay = classSessions.GroupBy(s => s.TimeTableClassroom.DayId).ToDictionary(g => g.Key.Value, g => g.ToList());

                // Get valid classroom subjects and their weekly quota
                List<ClassroomSubject> classroomSubjects = Unit_Of_Work.classroomSubject_Repository.FindBy(cs => cs.ClassroomID == classroomId && cs.IsDeleted!= true && !cs.Hide);

                Dictionary<long, int> subjectSessionLimits = classroomSubjects.ToDictionary(cs => cs.SubjectID, cs => Unit_Of_Work.subject_Repository.First_Or_Default(s => s.ID == cs.SubjectID)?.NumberOfSessionPerWeek ?? 0);

                // Track assignments: SubjectId -> Count
                Dictionary<long, int> assignedCount = subjectSessionLimits.ToDictionary(k => k.Key, k => 0);

                // Track daily assignments: (DayId, SubjectId) -> assigned
                HashSet<(long DayId, long SubjectId)> assignedPerDay = new HashSet<(long, long)>();

                // Flatten sessions
                List<TimeTableSession> allClassSessions = classSessions.OrderBy(x => x.ID).ToList();

                foreach (var session in allClassSessions)
                {
                    long dayId = session.TimeTableClassroom.DayId ?? 0;

                    // Select subject that still needs assignments and hasn’t been used on this day
                    var eligibleSubjects = subjectSessionLimits.Keys
                        .Where(subjectId =>
                            assignedCount[subjectId] < subjectSessionLimits[subjectId] &&
                            !assignedPerDay.Contains((dayId, subjectId)))
                        .ToList();

                    if (eligibleSubjects.Count == 0)
                        continue; // skip this session, nothing available

                    // Pick one randomly
                    long selectedSubjectId = eligibleSubjects[rng.Next(eligibleSubjects.Count)];

                    // Find teacher
                    long teacherId = Unit_Of_Work.classroomSubject_Repository.First_Or_Default(cs => cs.ClassroomID == classroomId && cs.SubjectID == selectedSubjectId)?.TeacherID ?? 1;

                    // Add assignment
                    timeTableSubjects.Add(new TimeTableSubject
                    {
                        TimeTableSessionID = session.ID,
                        SubjectID = selectedSubjectId,
                        TeacherID = teacherId,
                        InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                        InsertedByOctaId = userTypeClaim == "octa" ? userId : null,
                        InsertedByUserId = userTypeClaim == "employee" ? userId : null
                    });

                    // Track the assignment
                    assignedCount[selectedSubjectId]++;
                    assignedPerDay.Add((dayId, selectedSubjectId));
                }
            }

            // Save all subjects
            Unit_Of_Work.timeTableSubject_Repository.AddRange(timeTableSubjects);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }

        /////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
      allowedTypes: new[] { "octa", "employee" }
  )]
        public async Task<IActionResult> GetByIdAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            // Fetch the TimeTable and related entities including Classroom, Sessions, and Subjects
            TimeTable timeTable = await Unit_Of_Work.timeTable_Repository.FindByIncludesAsync(
                 t => t.ID == id && t.IsDeleted != true,
                 query => query
                     .Include(tt => tt.TimeTableClassrooms)
                         .ThenInclude(tc => tc.TimeTableSessions)
                             .ThenInclude(ts => ts.TimeTableSubjects)
                                 .ThenInclude(tss => tss.Subject)
                     .Include(tt => tt.TimeTableClassrooms)
                         .ThenInclude(tc => tc.TimeTableSessions)
                             .ThenInclude(ts => ts.TimeTableSubjects)
                                 .ThenInclude(tss => tss.Teacher)
                     .Include(tt => tt.TimeTableClassrooms)
                         .ThenInclude(tc => tc.Classroom)
                     .Include(tt => tt.TimeTableClassrooms)
                         .ThenInclude(tc => tc.Classroom.Grade) 
             );

            if (timeTable == null)
            {
                return BadRequest("No timetable with this ID");
            }

            TimeTableGetDTO Dto = mapper.Map<TimeTableGetDTO>(timeTable);

            // Return the grouped result as JSON
            return Ok(Dto);
        }
    }
}
