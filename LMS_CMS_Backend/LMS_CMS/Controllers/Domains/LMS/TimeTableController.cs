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
        
        [HttpGet("BySchoolId/{SchoolId}")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" }
       )]
        public IActionResult Get(long SchoolId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            School school = Unit_Of_Work.school_Repository.First_Or_Default(s=>s.ID == SchoolId & s.IsDeleted != true);
            if (school == null)
            {
                return BadRequest("No school with this ID");
            }

            AcademicYear academicYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(a=>a.SchoolID==SchoolId & a.IsDeleted != true && a.IsActive==true);
            if (academicYear == null)
            {
                return BadRequest("No active academic year in this school");
            }
            List<TimeTable> timeTable = Unit_Of_Work.timeTable_Repository.FindBy(t => t.IsDeleted != true && t.AcademicYearID== academicYear.ID);

            if (timeTable == null)
            {
                return NotFound();
            }
            List<TimeTableGetDTO> Dto = mapper.Map<List<TimeTableGetDTO>>(timeTable);

            return Ok(Dto);
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
                IsFavourite = false,
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

                int sessionCount = dayToPeriodCount[ttClassroom.DayId](ttClassroom.Classroom.Grade);

                for (int i = 0; i < sessionCount; i++)
                {
                    TimeTableSession session = new TimeTableSession
                    {
                        TimeTableClassroomID = ttClassroom.ID,
                        PeriodIndex = i+1,
                        InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                        InsertedByOctaId = userTypeClaim == "octa" ? userId : null,
                        InsertedByUserId = userTypeClaim == "employee" ? userId : null
                    };
                    sessions.Add(session);
                }
            }

            Unit_Of_Work.timeTableSession_Repository.AddRange(sessions);
            Unit_Of_Work.SaveChanges();

            /////////////////////// Assign Subjects to Sessions

            // Initialize random generator for shuffling subjects
            Random rng = new Random();

            // List to hold all TimeTableSubject records to be inserted
            List<TimeTableSubject> timeTableSubjects = new List<TimeTableSubject>();

            // Dictionary to track which teachers are assigned on a specific day and period across all classes
            var assignedTeachersPerDayPeriod = new Dictionary<(long DayId, int PeriodIndex), List<long>>();

            // Group sessions by ClassroomID so that we can handle each classroom separately
            var sessionsGroupedByClassroom = sessions .GroupBy(s => s.TimeTableClassroom.ClassroomID)
                .ToDictionary(g => g.Key, g => g.ToList()); // key value

            // Iterate over each classroom's sessions 
            foreach (var kvp in sessionsGroupedByClassroom)
            {
                long classroomId = kvp.Key;

                // Sort sessions in the classroom by DayId then by PeriodIndex (period within the day)
                var classSessions = kvp.Value
                    .OrderBy(s => s.TimeTableClassroom.DayId)
                    .ThenBy(s => s.PeriodIndex)
                    .ToList();

                // Get all subjects linked to this classroom that are not deleted or hidden
                List<ClassroomSubject> classroomSubjects = Unit_Of_Work.classroomSubject_Repository.FindBy(cs => cs.ClassroomID == classroomId && cs.IsDeleted != true && !cs.Hide);

                // For each subject, determine how many sessions per week it requires
                Dictionary<long, int> subjectSessionLimits = classroomSubjects.ToDictionary(cs => cs.SubjectID, cs => Unit_Of_Work.subject_Repository.First_Or_Default(s => s.ID == cs.SubjectID)?.NumberOfSessionPerWeek ?? 0);

                // Track how many times each subject has been assigned so far
                Dictionary<long, int> assignedCount = subjectSessionLimits.ToDictionary(k => k.Key, k => 0);

                // Group the sessions by day so we handle sessions day by day
                var sessionsByDay = classSessions.GroupBy(s => s.TimeTableClassroom.DayId);

                foreach (var dayGroup in sessionsByDay)
                {
                    long dayId = dayGroup.Key;

                    // Sort sessions in the day by PeriodIndex
                    var daySessions = dayGroup.OrderBy(s => s.PeriodIndex).ToList();
                    int sessionCursor = 0;

                    // Shuffle the classroom subjects for this day to avoid static ordering
                    var randomizedSubjects = classroomSubjects.OrderBy(x => rng.Next()).ToList();

                    while (sessionCursor < daySessions.Count)
                    {
                        var session = daySessions[sessionCursor];
                        int periodIndex = session.PeriodIndex;

                        // Get all subjects that still need sessions and have not reached their weekly number of sessions
                        var eligibleSubjects = randomizedSubjects
                            .Where(cs => assignedCount[cs.SubjectID] < subjectSessionLimits[cs.SubjectID])
                            .Select(cs => Unit_Of_Work.subject_Repository.First_Or_Default(s => s.ID == cs.SubjectID))
                            .Where(s => s != null)
                            .ToList();

                        if (!eligibleSubjects.Any())
                        {
                            sessionCursor++;
                            continue; // No eligible subjects, skip to next session
                        }

                        // Group eligible subjects by Category and Grade so similar ones are assigned together
                        var groupedSubjects = eligibleSubjects
                            .GroupBy(s => new { s.SubjectCategoryID, s.GradeID })
                            .OrderBy(x => rng.Next()) // Shuffle the groups
                            .ToList();

                        foreach (var group in groupedSubjects)
                        {
                            if (sessionCursor >= daySessions.Count) break;

                            var currentSession = daySessions[sessionCursor];
                            periodIndex = currentSession.PeriodIndex;

                            foreach (var subject in group)
                            {
                                long selectedSubjectId = subject.ID;

                                // Skip if the subject already reached its weekly limit
                                if (assignedCount[selectedSubjectId] >= subjectSessionLimits[selectedSubjectId])
                                    continue;

                                // Get the teacher assigned to this subject in this classroom
                                long? teacherId = Unit_Of_Work.classroomSubject_Repository
                                    .First_Or_Default(cs => cs.ClassroomID == classroomId && cs.SubjectID == selectedSubjectId)?.TeacherID;

                                // Check if any teacher is already assigned at this day and period
                                assignedTeachersPerDayPeriod.TryGetValue((dayId, periodIndex), out var assignedTeachers);
                                if (assignedTeachers == null)
                                    assignedTeachers = new List<long>();

                                // Prevent the same teacher from being double booked in the same period
                                if (teacherId != null && assignedTeachers.Contains(teacherId.Value))
                                {
                                    teacherId = null; // Set to null if already assigned elsewhere in same period
                                }
                                else if (teacherId != null)
                                {
                                    assignedTeachers.Add(teacherId.Value);
                                    assignedTeachersPerDayPeriod[(dayId, periodIndex)] = assignedTeachers;
                                }

                                // Create a TimeTableSubject entry linking session, subject, and teacher
                                timeTableSubjects.Add(new TimeTableSubject
                                {
                                    TimeTableSessionID = currentSession.ID,
                                    SubjectID = selectedSubjectId,
                                    TeacherID = teacherId,
                                    InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                                    InsertedByOctaId = userTypeClaim == "octa" ? userId : null,
                                    InsertedByUserId = userTypeClaim == "employee" ? userId : null
                                });

                                // Mark subject as assigned
                                assignedCount[selectedSubjectId]++;
                            }

                            sessionCursor++; // Move to next session
                        }
                    }
                }
            }

            // Save all timetable subjects to the database
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
                         .ThenInclude(tc => tc.Day)
                     .Include(tt => tt.TimeTableClassrooms)
                         .ThenInclude(tc => tc.Classroom.Grade)
                     .Include(tt => tt.AcademicYear)
             );

            if (timeTable == null)
            {
                return BadRequest("No timetable with this ID");
            }

            School school = Unit_Of_Work.school_Repository.First_Or_Default(s=>s.ID== timeTable.AcademicYear.SchoolID && s.IsDeleted != true );
            if (school == null)
            {
                return BadRequest("No school with this ID");
            }

            TimeTableGetDTO Dto = mapper.Map<TimeTableGetDTO>(timeTable);

            var groupedResult = Dto.TimeTableClassrooms
            .GroupBy(tc => new { tc.DayId, tc.DayName })
            .Select(dayGroup => new TimeTableDayGroupDTO
            {
                DayId = dayGroup.Key.DayId,
                DayName = dayGroup.Key.DayName,
                Grades = dayGroup
                    .GroupBy(tc => new { tc.GradeId, tc.GradeName })
                    .Select(gradeGroup => new GradeGroupDTO
                    {
                        GradeId = gradeGroup.Key.GradeId,
                        GradeName = gradeGroup.Key.GradeName,
                        Classrooms = gradeGroup
                            .GroupBy(tc => new { tc.ClassroomID, tc.ClassroomName })
                            .Select(classGroup => new ClassroomGroupDTO
                            {
                                ClassroomId = classGroup.Key.ClassroomID,
                                ClassroomName = classGroup.Key.ClassroomName,
                                Sessions = classGroup
                                    .SelectMany(c => c.TimeTableSessions)
                                    .Select(session => new SessionGroupDTO
                                    {
                                        SessionId = session.ID,
                                        Subjects = session.TimeTableSubjects.Select(s => new SubjectTeacherDTO
                                        {
                                            SubjectId = s.SubjectID,
                                            SubjectName = s.SubjectName,
                                            TeacherId = s.TeacherID,
                                            TeacherName = s.TeacherName
                                        }).ToList()
                                    }).ToList()
                            }).ToList()
                    }).ToList()
            }).ToList();

            // Return the grouped result as JSON
            return Ok(new { Data = groupedResult, TimeTableName = timeTable.Name, MaxPeriods = school.MaximumPeriodCountTimeTable });
        }
    }
}
