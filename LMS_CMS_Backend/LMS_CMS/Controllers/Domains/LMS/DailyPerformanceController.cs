using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Runtime.Intrinsics.Arm;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class DailyPerformanceController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public DailyPerformanceController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }
        /////////////////////////////////////////////

        [HttpGet("GetMasterByClassSubject/{ClassId}/{SubjectId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Enter Daily Performance", "Daily Performance" }
          )]
        public async Task<IActionResult> GetAsync(long ClassId , long SubjectId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<DailyPerformanceMaster> Data;

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            Data = await Unit_Of_Work.dailyPerformanceMaster_Repository
                .Select_All_With_IncludesById<DailyPerformanceMaster>(
                    f => f.IsDeleted != true && f.ClassroomID == ClassId && f.SubjectID == SubjectId,
                    query => query.Include(m => m.Subject).ThenInclude(s => s.Grade),
                    query => query.Include(m => m.Classroom),
                    query => query.Include(m => m.DailyPerformances).ThenInclude(dp => dp.Student),
                    query => query.Include(m => m.DailyPerformances).ThenInclude(dp => dp.StudentPerformance).ThenInclude(sp => sp.PerformanceType)
                );


            if (Data == null || Data.Count == 0)
            {
                return NotFound();
            }

            List<DailyPerformanceMasterGetDTO> Dto = mapper.Map<List<DailyPerformanceMasterGetDTO>>(Data);

            return Ok(Dto);
        }

        /////////////////////////////////////////////

        [HttpGet("GetById/{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Enter Daily Performance", "Daily Performance" }
        )]
        public async Task<IActionResult> GetByIdAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            var data = await Unit_Of_Work.dailyPerformanceMaster_Repository
                 .FindByIncludesAsync(
                     f => f.IsDeleted != true && f.ID == id,
                     query => query
                         .Include(m => m.Subject).ThenInclude(s => s.Grade)
                         .Include(m => m.Classroom)
                         .Include(m => m.DailyPerformances)
                             .ThenInclude(dp => dp.Student)
                         .Include(m => m.DailyPerformances)
                             .ThenInclude(dp => dp.StudentPerformance)
                                 .ThenInclude(sp => sp.PerformanceType)
                 );

             if (data == null)
                return NotFound();

            // filter out deleted students
            data.DailyPerformances = data.DailyPerformances
                .Where(dp => dp.Student?.IsDeleted != true)
                .ToList();

            var dto = mapper.Map<DailyPerformanceMasterGetDTO>(data);

            // ✅ Extract unique PerformanceTypeIDs from DTO
            var uniquePerformanceTypeIds = dto.DailyPerformances
                .SelectMany(p => p.StudentPerformance)
                .Select(sp => sp.PerformanceTypeID)
                .Distinct()
                .ToList();
            List<PerformanceType> performanceTypes = Unit_Of_Work.performanceType_Repository.FindBy(s => uniquePerformanceTypeIds.Contains(s.ID));

            List<PerformanceTypeGetDTO> performance = mapper.Map<List<PerformanceTypeGetDTO>>(performanceTypes);
            // ✅ Return both master DTO and list of unique type IDs
            return Ok(new
            {
                master = dto,
                performanceTypes = performance
            });
        }

        /////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Enter Daily Performance", "Daily Performance" }
        )]
        public async Task<IActionResult> Add(DailyPerformanceMasterAddDTO NewData)
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
            if (NewData == null)
            {
                return BadRequest("Type is empty");
            }

            Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(s=>s.ID== NewData.SubjectID && s.IsDeleted != true);
            if (subject == null)
            {
                return BadRequest("There is no subject with this id");
            }

            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(s => s.ID == NewData.ClassroomID && s.IsDeleted != true);
            if (classroom == null)
            {
                return BadRequest("There is no classroom with this id");
            }

            DailyPerformanceMaster dailyPerformanceMaster = mapper.Map<DailyPerformanceMaster>(NewData);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            dailyPerformanceMaster.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                dailyPerformanceMaster.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                dailyPerformanceMaster.InsertedByUserId = userId;
            }
            Unit_Of_Work.dailyPerformanceMaster_Repository.Add(dailyPerformanceMaster);

            Unit_Of_Work.SaveChanges();
            return Ok(NewData);
        }

        ///////////////////////////////////////////////////////////////////////////////////////--77
        [HttpGet("DailyPerformanceReport")]
        [Authorize_Endpoint_(
<<<<<<< HEAD
               allowedTypes: new[] { "octa", "employee" },
               pages: new[] { "Student Daily Performance Report" }
         )]
        public async Task<IActionResult> GetDailyPerformanceReport([FromQuery]long studentId, DateOnly fromDate, DateOnly toDate)
=======
         allowedTypes: new[] { "octa", "employee" , "parent" },
         pages: new[] { "Student Daily Performance Report" }
        )]
        public async Task<IActionResult> GetDailyPerformanceReport(
         long? schoolId,
         long? gradeId,
         long? classroomId,
         DateOnly? fromDate,
         DateOnly? toDate,
         long? studentId = null)
>>>>>>> d3c80e6e974597dce6a46f748d15cc832e779202
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = userClaims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = userClaims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or type does not exist");
            }


            if (fromDate == default(DateOnly) || toDate == default(DateOnly))
            {
                return BadRequest("The start date (fromDate) and end date (toDate) must be provided.");
            }

            if (toDate < fromDate)
            {
                return BadRequest("The end date must be after the start date.");
            }

            var student = await Unit_Of_Work.student_Repository
                .FindByIncludesAsync(
                    s => s.ID == studentId && s.IsDeleted != true,
                    query => query.Include(s => s.StudentGrades)
                );

            if (student == null)
            {
                return NotFound("the Student is not exist .");
            }

            List<DailyPerformanceMaster>? masters = await Unit_Of_Work.dailyPerformanceMaster_Repository
                .Select_All_With_IncludesById<DailyPerformanceMaster>(
                    m => m.IsDeleted != true && 
                         m.InsertedAt.HasValue &&
                         DateOnly.FromDateTime(m.InsertedAt.Value) >= fromDate &&
                         DateOnly.FromDateTime(m.InsertedAt.Value) <= toDate,
                    query => query.Include(m => m.DailyPerformances).ThenInclude(dp => dp.Student),
                    query => query.Include(m => m.DailyPerformances).ThenInclude(dp => dp.StudentPerformance).ThenInclude(sp => sp.PerformanceType)
                );

            var reportItems = new List<DailyPerformanceReportDTO>();

            foreach (var master in masters)
            {
                List<DailyPerformance>? studentPerformances = master.DailyPerformances
                    .Where(dp => dp.IsDeleted != true && dp.StudentID == studentId)
                    .ToList();

                var dailyStudentPerformance = new List<StudentPerformanceDTOs>();
                foreach (var dp in studentPerformances)
                {
                    foreach (var sp in dp.StudentPerformance.Where(s => s.IsDeleted != true))
                    {
                        dailyStudentPerformance.Add(new StudentPerformanceDTOs
                        {
                            PerformanceTypeID = sp.PerformanceTypeID,
                            PerformanceTypeEn = sp.PerformanceType.EnglishName,
                            PerformanceTypeAr = sp.PerformanceType.ArabicName
                        });
                    }
                }

                if (studentPerformances.Any())
                {
                    var lastDp = studentPerformances.Last(); 
                    reportItems.Add(new DailyPerformanceReportDTO
                    {
                        Date = DateOnly.FromDateTime(master.InsertedAt!.Value),
                        StudentId = lastDp.StudentID,
                        EnglishNameStudent = $"{lastDp.Student?.en_name}",
                        ArabicNameStudent = $"{lastDp.Student?.ar_name}",
                        StudentPerformance = dailyStudentPerformance,
                        Comment = lastDp.Comment
                    });
                }
            }

            if (!reportItems.Any())
            {
                return NotFound("No daily performance records were found for the specified criteria.");
            }

            reportItems = reportItems.OrderBy(r => r.Date).ToList();
            return Ok(reportItems);
        }
        // /////////////////////////////////////////////////////////////////////////////////////////--77
        [HttpGet("ClassroomDailyPerformanceAverages")]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" },
         pages: new[] { "Classroom Daily Performance Report" }
         )]
        public async Task<IActionResult> GetClassroomDailyPerformanceAverages([FromQuery]long classroomId, DateOnly fromDate, DateOnly toDate)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = userClaims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = userClaims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("The user ID or type does not exist.");
            }

            if (fromDate == default(DateOnly) || toDate == default(DateOnly))
            {
                return BadRequest("The start date (fromDate) and end date (toDate) must be provided.");
            }

            if (toDate < fromDate)
            {
                return BadRequest("The end date must be after the start date.");
            }

            var classroom = await Unit_Of_Work.classroom_Repository
                .FindByIncludesAsync(
                    c => c.ID == classroomId && c.IsDeleted != true
                );

            if (classroom == null)
            {
                return NotFound("The class does not exist.");
            }

            var masters = await Unit_Of_Work.dailyPerformanceMaster_Repository
                .Select_All_With_IncludesById<DailyPerformanceMaster>(
                    m => m.IsDeleted != true &&
                         m.ClassroomID == classroomId &&
                         m.InsertedAt.HasValue &&
                         DateOnly.FromDateTime(m.InsertedAt.Value) >= fromDate &&
                         DateOnly.FromDateTime(m.InsertedAt.Value) <= toDate,
                    query => query.Include(m => m.DailyPerformances)
                                  .ThenInclude(dp => dp.StudentPerformance)
                                  .ThenInclude(sp => sp.PerformanceType)
                );

            var reportItems = new List<ClassroomDailyPerformanceAverageDTO>();

         
            var groupedByDate = masters
                .GroupBy(m => DateOnly.FromDateTime(m.InsertedAt!.Value))
                .Select(g => new
                {
                    Date = g.Key,
                    Performances = g.SelectMany(m => m.DailyPerformances)
                                    .Where(dp => dp.IsDeleted != true)
                                    .Select(dp => new
                                    {
                                        Comment = dp.Comment,
                                        StudentPerformances = dp.StudentPerformance
                                            .Where(sp => sp.IsDeleted != true)
                                            .Select(sp => new
                                            {
                                                sp.PerformanceTypeID,
                                                sp.Stars,
                                                sp.PerformanceType.EnglishName,
                                                sp.PerformanceType.ArabicName
                                            }) 
                                            .ToList()
                                    })
                                    .ToList()
                });

            foreach (var group in groupedByDate)
            {
                // حساب متوسط درجات Stars لكل performanceTypeID في اليوم
                var performanceTypeAverages = group.Performances
                    .SelectMany(p => p.StudentPerformances)
                    .GroupBy(sp => sp.PerformanceTypeID)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Any() ? g.Average(sp => sp.Stars) : 0.0
                    );

                foreach (var performance in group.Performances)
                {
                    var studentPerformances = performance.StudentPerformances
                        .Select(sp => new StudentPerformanceDTO
                        {
                            PerformanceTypeID = sp.PerformanceTypeID,
                            PerformanceTypeEn = sp.EnglishName,
                            PerformanceTypeAr = sp.ArabicName,
                            AverageScore = performanceTypeAverages.ContainsKey(sp.PerformanceTypeID) ? performanceTypeAverages[sp.PerformanceTypeID] : 0.0
                        })
                        .DistinctBy(sp => sp.PerformanceTypeID) // لتجنب التكرار إذا كان هناك سجلات متكررة
                        .ToList();

                    reportItems.Add(new ClassroomDailyPerformanceAverageDTO
                    {
                        Date = group.Date,
                        ClassroomName = classroom.Name,
                        Comment = performance.Comment,
                        StudentPerformance = studentPerformances
                    });
                }
            }

            if (!reportItems.Any())
            {
                return NotFound("No daily performance records were found for the student in the specified date range.");
            }

            reportItems = reportItems.OrderBy(r => r.Date).ToList();
            return Ok(reportItems);
        }
    }
}



