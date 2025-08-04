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
    public class RemedialTimeTableController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public RemedialTimeTableController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////
        
        [HttpGet("BySchoolId/{SchoolId}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Remedial TimeTable" }
         )]
        public IActionResult Get(long SchoolId)
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
            List<RemedialTimeTable> timeTable = Unit_Of_Work.remedialTimeTable_Repository.FindBy(t => t.IsDeleted != true && t.AcademicYearID == academicYear.ID);

            if (timeTable == null)
            {
                return NotFound();
            }
            List<RemedialTimeTableGetDTO> Dto = mapper.Map<List<RemedialTimeTableGetDTO>>(timeTable);

            return Ok(Dto);
        }

        /////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Remedial TimeTable" }
         )]
        public async Task<IActionResult> GetById(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            RemedialTimeTable RemedialTimeTable =await Unit_Of_Work.remedialTimeTable_Repository.FindByIncludesAsync(t => t.IsDeleted != true && t.ID == id ,
                    query => query.Include(x => x.AcademicYear),
                    query => query.Include(x => x.RemedialTimeTableDays),
                    query => query.Include(emp => emp.AcademicYear));

            if (RemedialTimeTable == null)
            {
                return NotFound();
            }
            RemedialTimeTableGetDTO Dto = mapper.Map<RemedialTimeTableGetDTO>(RemedialTimeTable);

            return Ok(Dto);
        }

        /////////////////

        [HttpPost]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" },
         pages: new[] { "Remedial TimeTable" }
        )]
        public async Task<IActionResult> Add(RemedialTimeTableAddDTO NewRemedialTimeTable)
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
            if (NewRemedialTimeTable == null)
            {
                return NotFound();
            }

            School school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == NewRemedialTimeTable.SchoolId && s.IsDeleted != true);
            if (school == null)
                return BadRequest("No School With This Id");

            AcademicYear academicYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(a => a.SchoolID == NewRemedialTimeTable.SchoolId && a.IsDeleted != true && a.IsActive == true);
            if (academicYear == null)
                return BadRequest("There is no active academic year in this school");

            /////////////////////// Create the RemedialTimeTable

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            RemedialTimeTable remedialTimeTable = new RemedialTimeTable
            {
                AcademicYearID = academicYear.ID,
                Name = NewRemedialTimeTable.Name,
                IsFavourite = false,
                InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone)
            };
            if (userTypeClaim == "octa")
                remedialTimeTable.InsertedByOctaId = userId;
            else if (userTypeClaim == "employee")
                remedialTimeTable.InsertedByUserId = userId;

            Unit_Of_Work.remedialTimeTable_Repository.Add(remedialTimeTable);
            Unit_Of_Work.SaveChanges();

            /////////////////////// Create the RemedialTimeTableDay

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

            // Determine PeriodIndex based on MaximumPeriodCountRemedials
            int maxCount = school.MaximumPeriodCountRemedials ?? 0;
            List<int> PeriodIndex = Enumerable.Range(1, maxCount).ToList();
            List<RemedialTimeTableDay> RemedialTimeTableDays = new List<RemedialTimeTableDay>();

            foreach (var day in orderedDays)
            {
                foreach (var index in PeriodIndex)
                {
                    RemedialTimeTableDays.Add(new RemedialTimeTableDay
                    {
                        DayId = day.ID,
                        RemedialTimeTableID= remedialTimeTable.ID,
                        PeriodIndex = index,
                        InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                        InsertedByOctaId = userTypeClaim == "octa" ? userId : null,
                        InsertedByUserId = userTypeClaim == "employee" ? userId : null
                    });
                }
            }
            Unit_Of_Work.remedialTimeTableDay_Repository.AddRange(RemedialTimeTableDays);
            Unit_Of_Work.SaveChanges();

            return Ok();
        }

        /////////////////

        [HttpPut("IsFavourite")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           allowEdit: 1,
           pages: new[] { "Remedial TimeTable" }
         )]
        public IActionResult EditFavourite(long id, bool IsFavourite)
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

            RemedialTimeTable remedialTimeTable = Unit_Of_Work.remedialTimeTable_Repository.First_Or_Default(t => t.ID == id && t.IsDeleted != true);
            if (remedialTimeTable == null)
            {
                return BadRequest("this remedial TimeTable doesn't exist");
            }

            if (IsFavourite == true)
            {
                List<TimeTable> timetables = Unit_Of_Work.timeTable_Repository.FindBy(d => d.IsFavourite == true && d.AcademicYearID == remedialTimeTable.AcademicYearID);
                foreach (var t in timetables)
                {
                    t.IsFavourite = false;
                    Unit_Of_Work.timeTable_Repository.Update(t);
                }
            }

            remedialTimeTable.IsFavourite = IsFavourite;

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            remedialTimeTable.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                remedialTimeTable.UpdatedByOctaId = userId;
                if (remedialTimeTable.UpdatedByUserId != null)
                {
                    remedialTimeTable.UpdatedByUserId = null;
                }

            }
            else if (userTypeClaim == "employee")
            {
                remedialTimeTable.UpdatedByUserId = userId;
                if (remedialTimeTable.UpdatedByOctaId != null)
                {
                    remedialTimeTable.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.remedialTimeTable_Repository.Update(remedialTimeTable);
            Unit_Of_Work.SaveChanges();
            return Ok();

        }

        /////////////////
        
        [HttpPut]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowEdit: 1,
          pages: new[] { "Remedial TimeTable" }
        )]
        public IActionResult Edit(List<RemedialTimeTableEditDTO> NewRemedial)
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

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            foreach (var item in NewRemedial)
            {
                RemedialTimeTableDay remedialTimeTableDay = Unit_Of_Work.remedialTimeTableDay_Repository.First_Or_Default(s=>s.ID== item.ID && s.IsDeleted != true);
                if(remedialTimeTableDay == null)
                {
                    return BadRequest("this remedial TimeTable Session doesn't exist");
                }
                List<RemedialTimeTableClasses> remedialTimeTableClasses = new List<RemedialTimeTableClasses>();

                foreach (var item1 in item.RemedialClassroomIds)
                {

                    RemedialClassroom remedialClassroom = Unit_Of_Work.remedialClassroom_Repository.First_Or_Default(s => s.ID == item1 && s.IsDeleted != true && s.AcademicYearID == remedialTimeTableDay.RemedialTimeTable.AcademicYearID);
                    if (remedialClassroom == null)
                    {
                        return BadRequest("this Remedial Classroom doesn't exist");
                    }
                    remedialTimeTableClasses.Add(new RemedialTimeTableClasses
                    {
                        RemedialTimeTableDayId = item.ID,
                        RemedialClassroomID = item1,
                        InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                        InsertedByOctaId = userTypeClaim == "octa" ? userId : null,
                        InsertedByUserId = userTypeClaim == "employee" ? userId : null
                    });
                }
                Unit_Of_Work.remedialTimeTableClasses_Repository.AddRange(remedialTimeTableClasses);
                Unit_Of_Work.SaveChanges();

            }
            Unit_Of_Work.SaveChanges();
            return Ok();

        }
    }
}
