using AutoMapper;
using LMS_CMS_BL.DTO;
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
using System.Linq;

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
           allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Time Table" }
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

            AcademicYear academicYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(a=>a.SchoolID==SchoolId & a.IsDeleted != true && a.IsActive==true );
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
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Time Table" })]
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
            List<Classroom> classes = Unit_Of_Work.classroom_Repository.FindBy(c => gradesIds.Contains(c.GradeID) && c.AcademicYearID == academicYear.ID && c.IsDeleted != true);

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

            // order days by school.WeekStartDayID to school.WeekEndDayID

            List<Days> orderedDays;
            if (school.WeekStartDayID <= school.WeekEndDayID)
            {
                orderedDays = allDays
                    .Where(d => d.ID >= school.WeekStartDayID && d.ID <= school.WeekEndDayID)
                    .ToList();
            }
            else
            {
                orderedDays = allDays
                    .Where(d => d.ID >= school.WeekStartDayID)
                    .Concat(allDays.Where(d => d.ID <= school.WeekEndDayID))
                    .ToList();
            }

            // Create TimeTableClassroom combinations
            List<TimeTableClassroom> timeTableClassrooms = new List<TimeTableClassroom>();
            foreach (var classroom in classes)
            {
                foreach (var day in orderedDays)
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
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Time Table" }
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
                                    .OrderBy(session => session.PeriodIndex) // 👈 order by PeriodIndex here
                                    .Select(session => new SessionGroupDTO
                                    {
                                        SessionId = session.ID,
                                        PeriodIndex = session.PeriodIndex, // 👈 include PeriodIndex in response
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

        /////////////////

        [HttpGet("{id}/{date}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Time Table" }
        )]
        public async Task<IActionResult> GetByIdAsync(long id, DateOnly date)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            int dayId = 0;

            dayId = date.DayOfWeek switch
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

            // Get Duty list for the selected timetable and date
            List<Duty> duty = await Unit_Of_Work.duty_Repository.Select_All_With_IncludesById<Duty>(
                d => d.IsDeleted != true &&
                        d.Date == date &&
                        d.TimeTableSession.TimeTableClassroom.TimeTable.ID == id &&
                        d.TimeTableSession.TimeTableClassroom.TimeTable.IsDeleted != true,
                query => query.Include(d => d.Teacher),
                query => query.Include(d => d.TimeTableSession)
            );

            // Get timetable with all related entities
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
                return BadRequest("No timetable with this ID");

            // Get the school
            School school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == timeTable.AcademicYear.SchoolID && s.IsDeleted != true);
            if (school == null)
                return BadRequest("No school with this ID");

            // If this day is not within the school's working days
            if (school.WeekStartDayID.HasValue && school.WeekEndDayID.HasValue)
            {
                int startDay = (int)school.WeekStartDayID.Value;
                int endDay = (int)school.WeekEndDayID.Value;

                bool isValidDay;

                // Handle normal week range (e.g., Monday–Friday)
                if (startDay <= endDay)
                {
                    isValidDay = dayId >= startDay && dayId <= endDay;
                }
                else
                {
                    // Handle week wrap-around (e.g., Friday–Tuesday)
                    isValidDay = dayId >= startDay || dayId <= endDay;
                }

                if (!isValidDay)
                    return BadRequest("This day is Holiday.");
            }
            else
            {
                return BadRequest("School week start or end day not configured.");
            }


            // Map to DTO
            TimeTableGetDTO Dto = mapper.Map<TimeTableGetDTO>(timeTable);

            // Filter classrooms to only those on the requested day
            Dto.TimeTableClassrooms = Dto.TimeTableClassrooms
                .Where(tc => tc.DayId == dayId)
                .ToList();

            // Grouping the result by Day, Grade, Classroom, and Sessions
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
                                        .OrderBy(session => session.PeriodIndex) 
                                        .Select(session =>
                                        {
                                            var dutyForSession = duty.FirstOrDefault(d => d.TimeTableSessionID == session.ID);
                                            return new SessionGroupDTO
                                            {
                                                SessionId = session.ID,
                                                PeriodIndex = session.PeriodIndex,
                                                DutyTeacherId = dutyForSession?.TeacherID,
                                                DutyTeacherName = dutyForSession?.Teacher?.en_name,
                                                Subjects = session.TimeTableSubjects.Select(s => new SubjectTeacherDTO
                                                {
                                                    SubjectId = s.SubjectID,
                                                    SubjectName = s.SubjectName,
                                                    TeacherId = s.TeacherID,
                                                    TeacherName = s.TeacherName
                                                }).ToList()
                                            };
                                        }).ToList()
                                }).ToList()
                        }).ToList()
                }).ToList();

            return Ok(new
            {
                Data = groupedResult,
                TimeTableName = timeTable.Name,
                MaxPeriods = school.MaximumPeriodCountTimeTable
            });
        }

        /////////////////

        [HttpGet("GetAllClassesinThisTimetable/{Tid}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Time Table" }
        )]
        public async Task<IActionResult> GetAllClassesinThisTimetable(long Tid)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");
             
            List<TimeTableClassroom> timeTableClassroom = Unit_Of_Work.timeTableClassroom_Repository.FindBy(s=>s.TimeTableID== Tid && s.IsDeleted!= true);
            List<long> classroomsId = timeTableClassroom.Select(s=>s.ClassroomID).Distinct().ToList();

            List<Classroom> classroom = Unit_Of_Work.classroom_Repository.FindBy(s => classroomsId.Contains( s.ID )&& s.IsDeleted != true);
            List<ClassroomGetDTO> classroomsDTO = mapper.Map<List<ClassroomGetDTO>>(classroom);

            return Ok(classroomsDTO);
        }

        /////////////////

        [HttpGet("GetAllTeachersinThisTimetable/{Tid}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Time Table" }
        )]
        public async Task<IActionResult> GetAllTeachersinThisTimetable(long Tid)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            List<TimeTableSubject> timeTableSubjects = Unit_Of_Work.timeTableSubject_Repository.FindBy(s => s.TimeTableSession.TimeTableClassroom.TimeTableID == Tid && s.IsDeleted != true);
            List<long> TeacherIDs = timeTableSubjects.Where(s => s.TeacherID.HasValue).Select(s => s.TeacherID.Value).Distinct().ToList();

            List<Employee> employee = Unit_Of_Work.employee_Repository.FindBy(s => TeacherIDs.Contains(s.ID) && s.IsDeleted != true);
            List<Employee_GetDTO> employeesDTO = mapper.Map<List<Employee_GetDTO>>(employee);

            return Ok(employeesDTO);
        }

        /////////////////

        [HttpGet("GetByIdForClassAsync/{Tid}/{ClassId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Time Table" }
        )]
        public async Task<IActionResult> GetByIdForClassAsync(long Tid , long ClassId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(s => s.ID == ClassId);

            // Fetch the TimeTable and related entities including Classroom, Sessions, and Subjects
            TimeTable timeTable = await Unit_Of_Work.timeTable_Repository.FindByIncludesAsync(
                t => t.ID == Tid && t.IsDeleted != true,
                query => query
                    .Include(tt => tt.TimeTableClassrooms.Where(tc => tc.ClassroomID == ClassId && tc.IsDeleted != true))
                        .ThenInclude(tc => tc.TimeTableSessions)
                            .ThenInclude(ts => ts.TimeTableSubjects)
                                .ThenInclude(tss => tss.Subject)
                    .Include(tt => tt.TimeTableClassrooms.Where(tc => tc.ClassroomID == ClassId && tc.IsDeleted != true))
                        .ThenInclude(tc => tc.TimeTableSessions)
                            .ThenInclude(ts => ts.TimeTableSubjects)
                                .ThenInclude(tss => tss.Teacher)
                    .Include(tt => tt.TimeTableClassrooms.Where(tc => tc.ClassroomID == ClassId && tc.IsDeleted != true))
                        .ThenInclude(tc => tc.Classroom)
                    .Include(tt => tt.TimeTableClassrooms.Where(tc => tc.ClassroomID == ClassId && tc.IsDeleted != true))
                        .ThenInclude(tc => tc.Day)
                    .Include(tt => tt.TimeTableClassrooms.Where(tc => tc.ClassroomID == ClassId && tc.IsDeleted != true))
                        .ThenInclude(tc => tc.Classroom.Grade)
                    .Include(tt => tt.AcademicYear)
            );

            if (timeTable == null)
            {
                return BadRequest("No timetable with this ID");
            }

            School school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == timeTable.AcademicYear.SchoolID && s.IsDeleted != true);
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
            return Ok(new { Data = groupedResult, TimeTableName = timeTable.Name, MaxPeriods = school.MaximumPeriodCountTimeTable , ClassName = classroom .Name});
        }


        /////////////////

        [HttpGet("GetByIdForStudentIdAsync/{StudentId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" , "student" },
            pages: new[] { "Time Table" }
        )]
        public async Task<IActionResult> GetByIdForStudentIdAsync( long StudentId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            StudentClassroom studentClassrooms = await Unit_Of_Work.studentClassroom_Repository.FindByIncludesAsync(
                query => query.IsDeleted != true && query.StudentID == StudentId && query.Student.IsDeleted != true && query.Classroom.IsDeleted != true && query.Classroom.AcademicYear.IsActive == true,
                query => query.Include(stu => stu.Student),
                query => query.Include(stu => stu.Classroom.AcademicYear),
                query => query.Include(stu => stu.Classroom.AcademicYear.School)
            );

            if (studentClassrooms == null)
            {
                return NotFound();
            }

            School school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == studentClassrooms.Classroom.AcademicYear.SchoolID && s.IsDeleted != true);
            if (school == null)
            {
                return BadRequest("No school with this ID");
            }

            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(s => s.ID == studentClassrooms.ClassID);

            // Fetch the TimeTable and related entities including Classroom, Sessions, and Subjects
            TimeTable timeTable = await Unit_Of_Work.timeTable_Repository.FindByIncludesAsync(
                t => t.AcademicYearID == studentClassrooms.Classroom.AcademicYearID && t.IsFavourite == true && t.IsDeleted != true,
                query => query
                    .Include(tt => tt.TimeTableClassrooms.Where(tc => tc.ClassroomID == studentClassrooms.ClassID && tc.IsDeleted != true))
                        .ThenInclude(tc => tc.TimeTableSessions)
                            .ThenInclude(ts => ts.TimeTableSubjects)
                                .ThenInclude(tss => tss.Subject)
                    .Include(tt => tt.TimeTableClassrooms.Where(tc => tc.ClassroomID == studentClassrooms.ClassID && tc.IsDeleted != true))
                        .ThenInclude(tc => tc.TimeTableSessions)
                            .ThenInclude(ts => ts.TimeTableSubjects)
                                .ThenInclude(tss => tss.Teacher)
                    .Include(tt => tt.TimeTableClassrooms.Where(tc => tc.ClassroomID == studentClassrooms.ClassID && tc.IsDeleted != true))
                        .ThenInclude(tc => tc.Classroom)
                    .Include(tt => tt.TimeTableClassrooms.Where(tc => tc.ClassroomID == studentClassrooms.ClassID && tc.IsDeleted != true))
                        .ThenInclude(tc => tc.Day)
                    .Include(tt => tt.TimeTableClassrooms.Where(tc => tc.ClassroomID == studentClassrooms.ClassID && tc.IsDeleted != true))
                        .ThenInclude(tc => tc.Classroom.Grade)
                    .Include(tt => tt.AcademicYear)
            );

            if (timeTable == null)
            {
                return BadRequest("No timetable with this ID");
            }

            //School school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == timeTable.AcademicYear.SchoolID && s.IsDeleted != true);
            //if (school == null)
            //{
            //    return BadRequest("No school with this ID");
            //}

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
            return Ok(new { Data = groupedResult, TimeTableName = timeTable.Name, MaxPeriods = school.MaximumPeriodCountTimeTable, ClassName = classroom.Name });
        }

        /////////////////

        [HttpGet("GetByIdForTeacherAsync/{Tid}/{TeacherId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" } ,
            pages: new[] { "Time Table" }
        )]
        public async Task<IActionResult> GetByIdForTeacherAsync(long Tid, long TeacherId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            Employee teacher = Unit_Of_Work.employee_Repository.First_Or_Default(s => s.ID == TeacherId);

            // Fetch the TimeTable and related entities including Classroom, Sessions, and Subjects
            TimeTable timeTable = await Unit_Of_Work.timeTable_Repository.FindByIncludesAsync(
                t => t.ID == Tid && t.IsDeleted != true,
                query => query
                    .Include(tt => tt.TimeTableClassrooms
                        .Where(tc => tc.IsDeleted != true))
                        .ThenInclude(tc => tc.TimeTableSessions)
                            .ThenInclude(ts => ts.TimeTableSubjects
                                .Where(tss => tss.IsDeleted != true && tss.TeacherID == TeacherId))
                                .ThenInclude(tss => tss.Subject)
                    .Include(tt => tt.TimeTableClassrooms)
                        .ThenInclude(tc => tc.TimeTableSessions)
                            .ThenInclude(ts => ts.TimeTableSubjects
                                .Where(tss => tss.IsDeleted != true && tss.TeacherID == TeacherId))
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

            School school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == timeTable.AcademicYear.SchoolID && s.IsDeleted != true);
            if (school == null)
            {
                return BadRequest("No school with this ID");
            }

            TimeTableGetDTO Dto = mapper.Map<TimeTableGetDTO>(timeTable);

            var groupedResult = Dto.TimeTableClassrooms
              .GroupBy(tc => new { tc.DayId, tc.DayName })
              .Select(dayGroup => new
              {
                  DayId = dayGroup.Key.DayId,
                  DayName = dayGroup.Key.DayName,
                  Sessions = dayGroup
                      .SelectMany(tc => tc.TimeTableSessions.Select(session => new
                      {
                          Session = session,
                          GradeId = tc.GradeId,
                          GradeName = tc.GradeName,
                          ClassroomId = tc.ClassroomID,
                          ClassroomName = tc.ClassroomName
                      }))
                      .GroupBy(s => s.Session.ID)
                      .Select(sessionGroup => new
                      {
                          SessionId = sessionGroup.Key,
                          Subjects = sessionGroup
                              .SelectMany(s => s.Session.TimeTableSubjects)
                              .Where(sub => sub.TeacherID == TeacherId)
                              .Select(sub => new
                              {
                                  sub.SubjectID,
                                  sub.SubjectName,
                                  sub.TeacherID,
                                  sub.TeacherName
                              }).ToList(),
                          Classes = sessionGroup.Select(s => new
                          {
                              s.ClassroomId,
                              s.ClassroomName,
                              s.GradeId,
                              s.GradeName
                          }).ToList()
                      })
                      .Where(s => s.Subjects.Any())
                      .ToList()
              })
              .Where(d => d.Sessions.Any())
              .ToList();

            // Return the grouped result as JSON
            return Ok(new { Data = groupedResult, TimeTableName = timeTable.Name, MaxPeriods = school.MaximumPeriodCountTimeTable , TeacherName = teacher.en_name });
        }

        /////////////////

        [HttpPut]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           allowEdit: 1,
           pages: new[] { "Time Table" }
       )]
        public IActionResult EditFavourite(long id , bool IsFavourite)
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
           
            TimeTable timeTable= Unit_Of_Work.timeTable_Repository.First_Or_Default(t=>t.ID==id && t.IsDeleted != true);
            if (timeTable == null)
            {
                return BadRequest("this time table doesn't exist");
            }
          
            if(IsFavourite == true)
            {
                List<TimeTable> timetables = Unit_Of_Work.timeTable_Repository.FindBy(d => d.IsFavourite == true && d.AcademicYearID== timeTable.AcademicYearID);
                foreach (var t in timetables)
                {
                    t.IsFavourite = false;
                    Unit_Of_Work.timeTable_Repository.Update(t);
                }
            }

            timeTable.IsFavourite= IsFavourite;

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            timeTable.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                timeTable.UpdatedByOctaId = userId;
                if (timeTable.UpdatedByUserId != null)
                {
                    timeTable.UpdatedByUserId = null;
                }

            }
            else if (userTypeClaim == "employee")
            {
                timeTable.UpdatedByUserId = userId;
                if (timeTable.UpdatedByOctaId != null)
                {
                    timeTable.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.timeTable_Repository.Update(timeTable);
            Unit_Of_Work.SaveChanges();
            return Ok();

        }

        /////////////////

        [HttpPut("Replace")]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" },
         allowEdit: 1,
         pages: new[] { "Time Table" }
         )]
        public async Task<IActionResult> EditAsync(List<TimeTableReplaceEditDTO> SessionReplaced)
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

            foreach (var item in SessionReplaced)
            {
                // IsSessionsExist
                TimeTableSession firstSession = await Unit_Of_Work.timeTableSession_Repository.FindByIncludesAsync(
                    t => t.ID == item.FisrtSessionId,
                    q => q.Include(tt => tt.TimeTableSubjects),
                    q => q.Include(tt => tt.TimeTableClassroom)
                );
                if (firstSession == null)
                    return BadRequest($"No TimeTableSession found with ID {item.FisrtSessionId}");


                TimeTableSession secondSession = await Unit_Of_Work.timeTableSession_Repository.FindByIncludesAsync(
                    t => t.ID == item.SecondSessionId,
                    q => q.Include(tt => tt.TimeTableSubjects).ThenInclude(ts => ts.Teacher),
                    q => q.Include(tt => tt.TimeTableClassroom)
                );
                if (secondSession == null)
                    return BadRequest($"No TimeTableSession found with ID {item.SecondSessionId}");


                if (firstSession.TimeTableClassroom.TimeTableID != secondSession.TimeTableClassroom.TimeTableID)
                    return BadRequest("The two sessions are not in the same timetable.");

                long timetableId = firstSession.TimeTableClassroom.TimeTableID;

                // validate that this subjects can add to another session 
                List<ClassroomSubject> firstClassroomSubjects = Unit_Of_Work.classroomSubject_Repository.FindBy(cs => cs.ClassroomID == firstSession.TimeTableClassroom.ClassroomID && cs.IsDeleted != true && !cs.Hide);
                List<ClassroomSubject> secondClassroomSubjects = Unit_Of_Work.classroomSubject_Repository.FindBy(cs => cs.ClassroomID == secondSession.TimeTableClassroom.ClassroomID && cs.IsDeleted != true && !cs.Hide);

                var firstSessionSubjectIds = firstSession.TimeTableSubjects.Select(ts => ts.SubjectID).Distinct().ToList();
                var secondSessionSubjectIds = secondSession.TimeTableSubjects.Select(ts => ts.SubjectID).Distinct().ToList();

                var firstClassroomSubjectIds = firstClassroomSubjects.Select(cs => cs.SubjectID).Distinct().ToList();
                var secondClassroomSubjectIds = secondClassroomSubjects.Select(cs => cs.SubjectID).Distinct().ToList();

                // Check that all subjects in firstSession exist in second classroom subjects
                if (firstSessionSubjectIds.Any(subId => !secondClassroomSubjectIds.Contains((long)subId)))
                    return BadRequest("One or more subjects in the first session are not allowed in the second classroom.");

                // Check that all subjects in secondSession exist in first classroom subjects
                if (secondSessionSubjectIds.Any(subId => !firstClassroomSubjectIds.Contains((long)subId)))
                    return BadRequest("One or more subjects in the second session are not allowed in the first classroom.");

                // validate teachers are available

                List<long> firstSessionTeacherIds = firstSession.TimeTableSubjects
                     .Where(s => s.TeacherID.HasValue)
                     .Select(s => s.TeacherID.Value)
                     .ToList();

                List<TimeTableSubject> conflictingFirstTeachers = Unit_Of_Work.timeTableSubject_Repository
                    .FindBy(e =>
                        e.TimeTableSession.ID != item.SecondSessionId &&
                        e.TimeTableSession.ID != item.FisrtSessionId &&
                        e.TimeTableSession.TimeTableClassroom.TimeTableID == timetableId &&
                        e.TimeTableSession.PeriodIndex == secondSession.PeriodIndex &&
                        e.TimeTableSession.TimeTableClassroom.DayId == secondSession.TimeTableClassroom.DayId &&
                        e.IsDeleted != true &&
                        e.TeacherID.HasValue &&
                        firstSessionTeacherIds.Contains(e.TeacherID.Value)
                    )
                    .ToList();

                if (conflictingFirstTeachers.Any())
                    return BadRequest("One of the teachers in the first session is already assigned in the second session slot.");

                List<long> secondSessionTeacherIds = secondSession.TimeTableSubjects
                    .Where(s => s.TeacherID.HasValue)
                    .Select(s => s.TeacherID.Value)
                    .ToList();

                List<TimeTableSubject> conflictingSecondTeachers = Unit_Of_Work.timeTableSubject_Repository
                    .FindBy(e =>
                        e.TimeTableSession.ID != item.SecondSessionId &&
                        e.TimeTableSession.ID != item.FisrtSessionId &&
                        e.TimeTableSession.TimeTableClassroom.TimeTableID == timetableId &&
                        e.TimeTableSession.PeriodIndex == firstSession.PeriodIndex &&
                        e.TimeTableSession.TimeTableClassroom.DayId == firstSession.TimeTableClassroom.DayId &&
                        e.IsDeleted != true &&
                        e.TeacherID.HasValue &&
                        secondSessionTeacherIds.Contains(e.TeacherID.Value)
                    )
                    .ToList();

                if (conflictingSecondTeachers.Any())
                    return BadRequest("One of the teachers in the second session is already assigned in the first session slot.");



                // Swap subjects
                foreach (TimeTableSubject item1 in firstSession.TimeTableSubjects)
                {
                    item1.TimeTableSessionID = item.SecondSessionId;
                }

                foreach (TimeTableSubject item1 in secondSession.TimeTableSubjects)
                {
                    item1.TimeTableSessionID = item.FisrtSessionId;
                }

                Unit_Of_Work.timeTableSubject_Repository.UpdateRange(firstSession.TimeTableSubjects);
                Unit_Of_Work.timeTableSubject_Repository.UpdateRange(secondSession.TimeTableSubjects);
                Unit_Of_Work.SaveChanges();
            }
            return Ok();

        }

        /////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
               allowedTypes: new[] { "octa", "employee" },
               allowDelete: 1,
               pages: new[] { "Time Table" }
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
                TimeTable timeTable = Unit_Of_Work.timeTable_Repository.Select_By_Id(id);

                if (timeTable == null || timeTable.IsDeleted == true)
                {
                    return NotFound("No TimeTable with this ID");
                }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Time Table", roleId, userId, timeTable);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            timeTable.IsDeleted = true;
                TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                timeTable.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    timeTable.DeletedByOctaId = userId;
                    if (timeTable.DeletedByUserId != null)
                    {
                        timeTable.DeletedByUserId = null;
                    }
                }
                else if (userTypeClaim == "employee")
                {
                    timeTable.DeletedByUserId = userId;
                    if (timeTable.DeletedByOctaId != null)
                    {
                        timeTable.DeletedByOctaId = null;
                    }
                }

                Unit_Of_Work.timeTable_Repository.Update(timeTable);
                Unit_Of_Work.SaveChanges();
                return Ok();
            }
    }
}

