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
using System.Diagnostics;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class SemesterWorkingWeekController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public SemesterWorkingWeekController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////////////////////////

        [HttpGet("GetBySemesterID/{id}")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Working Weeks" }
         )]
        public async Task<IActionResult> GetAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Semester Semester = Unit_Of_Work.semester_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == id);
            if (Semester == null)
            {
                return NotFound("No Semester With this ID");
            }

            List<SemesterWorkingWeek> semesterWorkingWeeks = await Unit_Of_Work.semesterWorkingWeek_Repository.Select_All_With_IncludesById<SemesterWorkingWeek>(
                    f => f.IsDeleted != true && f.SemesterID == id,
                    query => query.Include(emp => emp.Semester)
                    );

            if (semesterWorkingWeeks == null || semesterWorkingWeeks.Count == 0)
            {
                return NotFound();
            }

            List<SemesterWorkingWeekGetDTO> semesterWorkingWeeksDTO = mapper.Map<List<SemesterWorkingWeekGetDTO>>(semesterWorkingWeeks);
             
            return Ok(semesterWorkingWeeksDTO);
        }
        
        ////////////////////////////////////////////////////

        [HttpGet("GetByID/{id}")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Working Weeks" }
         )]
        public async Task<IActionResult> GetByIdAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
              
            SemesterWorkingWeek semesterWorkingWeek = await Unit_Of_Work.semesterWorkingWeek_Repository.FindByIncludesAsync(
                    f => f.IsDeleted != true && f.ID == id,
                    query => query.Include(emp => emp.Semester)
                    );

            if (semesterWorkingWeek == null)
            {
                return NotFound();
            }

            SemesterWorkingWeekGetDTO semesterWorkingWeekDTO = mapper.Map<SemesterWorkingWeekGetDTO>(semesterWorkingWeek);
             
            return Ok(semesterWorkingWeekDTO);
        }

        ////////////////////////////////////////////////////

        [HttpPost("GenerateWeeks/{semesterId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Working Weeks" }
        )]
        public async Task<IActionResult> GenerateAsync(long semesterId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (semesterId == null)
            {
                return BadRequest("Semester Id cannot be null");
            }

            Semester Semester = await Unit_Of_Work.semester_Repository.FindByIncludesAsync(d => d.IsDeleted != true && d.ID == semesterId, query => query.Include(emp => emp.AcademicYear));
            if (Semester == null)
            {
                return NotFound("No Semester With this ID");
            }

            List<SemesterWorkingWeek> semesterWorkingWeeks = Unit_Of_Work.semesterWorkingWeek_Repository.FindBy(
                f => f.IsDeleted != true && f.SemesterID == semesterId);
            if (semesterWorkingWeeks != null && semesterWorkingWeeks.Count != 0)
            {
                foreach (var semesterWorkingWeek in semesterWorkingWeeks)
                {
                    semesterWorkingWeek.IsDeleted = true;
                    semesterWorkingWeek.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        semesterWorkingWeek.DeletedByOctaId = userId;
                        if (semesterWorkingWeek.DeletedByUserId != null)
                        {
                            semesterWorkingWeek.DeletedByUserId = null;
                        }
                    }
                    else if (userTypeClaim == "employee")
                    {
                        semesterWorkingWeek.DeletedByUserId = userId;
                        if (semesterWorkingWeek.DeletedByOctaId != null)
                        {
                            semesterWorkingWeek.DeletedByOctaId = null;
                        }
                    }

                    Unit_Of_Work.semesterWorkingWeek_Repository.Update(semesterWorkingWeek);
                }
            } 

            School school = Unit_Of_Work.school_Repository.First_Or_Default(d => d.ID == Semester.AcademicYear.SchoolID && d.IsDeleted != true);
            if (school.WeekEndDayID == null || school.WeekStartDayID == null)
            {
                return BadRequest("You need to assign Week Days To School");
            }

            string semesterDateFrom = Semester.DateFrom;
            string semesterDateTo = Semester.DateTo;

            long SchoolStartDay = (long)school.WeekStartDayID; // School week start day
            long SchoolEndDay = (long)school.WeekEndDayID; // School week end day

            // Parse the semester dates
            DateOnly semesterStartDate = DateOnly.Parse(semesterDateFrom);
            DateOnly semesterEndDate = DateOnly.Parse(semesterDateTo);

            List<SemesterWorkingWeek> weeks = new List<SemesterWorkingWeek>();
            int weekCount = 1;

            // Calculate the length of the school week (number of days in the school week)
            int schoolWeekLength = (SchoolEndDay >= SchoolStartDay)
                ? (int)(SchoolEndDay - SchoolStartDay + 1)
                : (int)(7 - SchoolStartDay + SchoolEndDay + 1); // Wrap around case (e.g., Sunday to Thursday)

            // First Week: It might be shorter depending on the semester start date
            DateOnly firstWeekStart = semesterStartDate;
            DateOnly firstWeekEnd = GetFirstWeekEndDate(firstWeekStart, SchoolStartDay, SchoolEndDay);
            DateOnly schoolStartDay = GetSchoolDayDate(semesterStartDate, SchoolStartDay);

            SemesterWorkingWeek firstWeek = new SemesterWorkingWeek
            {
                SemesterID = semesterId,
                DateFrom = firstWeekStart,
                DateTo = firstWeekEnd,
                EnglishName = $"Week {weekCount}",
                ArabicName = $"الأسبوع {weekCount}",
                InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                InsertedByOctaId = userTypeClaim == "octa" ? userId : null,
                InsertedByUserId = userTypeClaim == "employee" ? userId : null
            };

            int daysDifference = (firstWeek.DateTo.ToDateTime(new TimeOnly(0, 0)) - firstWeek.DateFrom.ToDateTime(new TimeOnly(0, 0))).Days;

            if (daysDifference >= schoolWeekLength)
            {
                firstWeek.DateFrom = schoolStartDay;
            }

            if(firstWeek.DateTo <= semesterEndDate)
            {
                weeks.Add(firstWeek);
                weekCount++;

                // Generate Full Weeks (from School Start Day to School End Day)
                DateOnly currentStartOfWeek = firstWeekEnd.AddDays(1);
                while (currentStartOfWeek <= semesterEndDate)
                {
                    // Make sure each week starts on the school start day (e.g., Sunday)
                    int daysUntilStartOfWeek = (int)(SchoolStartDay - (int)currentStartOfWeek.DayOfWeek + 7) % 7;
                    DateOnly adjustedStartOfWeek = currentStartOfWeek.AddDays(daysUntilStartOfWeek);

                    // If the adjusted start of the week is after the semester end date, stop
                    if (adjustedStartOfWeek > semesterEndDate)
                    {
                        break;  // Exit the loop as we don't want to add any weeks after the semester ends
                    }

                    // Calculate the end of the current week
                    DateOnly currentEndOfWeek = adjustedStartOfWeek.AddDays(schoolWeekLength - 1);  // Full week
                    if (currentEndOfWeek > semesterEndDate)
                    {
                        currentEndOfWeek = semesterEndDate;  // Cap at semester end date
                    }

                    // Add the week to the list
                    weeks.Add(new SemesterWorkingWeek
                    {
                        SemesterID = semesterId,
                        DateFrom = adjustedStartOfWeek,
                        DateTo = currentEndOfWeek,
                        EnglishName = $"Week {weekCount}",
                        ArabicName = $"الأسبوع {weekCount}",
                        InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                        InsertedByOctaId = userTypeClaim == "octa" ? userId : null,
                        InsertedByUserId = userTypeClaim == "employee" ? userId : null
                    });

                    // Increment the week count
                    weekCount++;

                    // Move to the next week
                    currentStartOfWeek = currentEndOfWeek.AddDays(1);
                }

                foreach (var week in weeks)
                {
                    Unit_Of_Work.semesterWorkingWeek_Repository.Add(week);
                }
            }

            Unit_Of_Work.SaveChanges();
            return Ok();
        }

        ////////////////////////////////////////////////////

        private DateOnly GetFirstWeekEndDate(DateOnly semesterStartDate, long schoolStartDay, long schoolEndDay)
        {
            // Calculate how many days until the school end day (for the first week)
            int daysUntilSchoolEnd = (int)(schoolEndDay - (int)semesterStartDate.DayOfWeek + 7) % 7;
            DateOnly firstWeekEnd = semesterStartDate.AddDays(daysUntilSchoolEnd);

            return firstWeekEnd;
        }

        ////////////////////////////////////////////////////

        private DateOnly GetSchoolDayDate(DateOnly semesterStartDate, long schoolDay)
        {
            // Calculate how many days until the school day (e.g., Sunday, Monday, etc.)
            int daysUntilSchoolDay = ((int)schoolDay - (int)semesterStartDate.DayOfWeek + 7) % 7;
            DateOnly schoolDayDate = semesterStartDate.AddDays(daysUntilSchoolDay);

            return schoolDayDate;
        }

        ////////////////////////////////////////////////////
        
        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Working Weeks" }
        )]
        public async Task<IActionResult> Add(SemesterWorkingWeekAddDTO NewWorkingWeek)
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
            if (NewWorkingWeek == null)
            {
                return BadRequest("Working Week can not be null");
            }

            if (NewWorkingWeek.DateFrom > NewWorkingWeek.DateTo)
            {
                return BadRequest("Date From must be earlier than Date To.");
            }

            Semester Semester = Unit_Of_Work.semester_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewWorkingWeek.SemesterID);
            if (Semester == null)
            {
                return NotFound("No Semester With this ID");
            }

            if (!DateOnly.TryParse(Semester.DateFrom, out DateOnly semesterDateFrom) ||
                !DateOnly.TryParse(Semester.DateTo, out DateOnly semesterDateTo))
            {
                return BadRequest("Semester DateFrom or DateTo is not in a valid format. Expected format: yyyy-MM-dd.");
            }
             
            if (NewWorkingWeek.DateFrom < semesterDateFrom || NewWorkingWeek.DateTo > semesterDateTo)
            {
                return BadRequest($"DateFrom and DateTo must be within the semester range ({semesterDateFrom} to {semesterDateTo}).");
            }

            SemesterWorkingWeek semesterWorkingWeek = mapper.Map<SemesterWorkingWeek>(NewWorkingWeek);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            semesterWorkingWeek.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                semesterWorkingWeek.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                semesterWorkingWeek.InsertedByUserId = userId;
            } 

            Unit_Of_Work.semesterWorkingWeek_Repository.Add(semesterWorkingWeek);
            Unit_Of_Work.SaveChanges();
            return Ok(NewWorkingWeek);
        }
        ////////////////////////////////////////////////////
        
        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Working Weeks" }
        )]
        public async Task<IActionResult> Edit(SemesterWorkingWeekPutDTO EditWorkingWeek)
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
            if (EditWorkingWeek == null)
            {
                return BadRequest("Working Week can not be null");
            }

            if (EditWorkingWeek.DateFrom > EditWorkingWeek.DateTo)
            {
                return BadRequest("Date From must be earlier than Date To.");
            }

            SemesterWorkingWeek semesterWorkingWeek = Unit_Of_Work.semesterWorkingWeek_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == EditWorkingWeek.ID);
            if(semesterWorkingWeek == null)
            {
                return NotFound("No Working Week With this ID");
            }

            Semester Semester = Unit_Of_Work.semester_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == EditWorkingWeek.SemesterID);
            if (Semester == null)
            {
                return NotFound("No Semester With this ID");
            }

            if (!DateOnly.TryParse(Semester.DateFrom, out DateOnly semesterDateFrom) ||
                !DateOnly.TryParse(Semester.DateTo, out DateOnly semesterDateTo))
            {
                return BadRequest("Semester DateFrom or DateTo is not in a valid format. Expected format: yyyy-MM-dd.");
            }
             
            if (EditWorkingWeek.DateFrom < semesterDateFrom || EditWorkingWeek.DateTo > semesterDateTo)
            {
                return BadRequest($"DateFrom and DateTo must be within the semester range ({semesterDateFrom} to {semesterDateTo}).");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Working Weeks", roleId, userId, EditWorkingWeek);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }


            mapper.Map(EditWorkingWeek, semesterWorkingWeek);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            semesterWorkingWeek.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                semesterWorkingWeek.UpdatedByOctaId = userId;
                if (semesterWorkingWeek.UpdatedByUserId != null)
                {
                    semesterWorkingWeek.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                semesterWorkingWeek.UpdatedByUserId = userId;
                if (semesterWorkingWeek.UpdatedByOctaId != null)
                {
                    semesterWorkingWeek.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.semesterWorkingWeek_Repository.Update(semesterWorkingWeek);
            Unit_Of_Work.SaveChanges(); 
            return Ok(EditWorkingWeek);
        }

        ////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Working Weeks" }
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

            SemesterWorkingWeek workingWeek = Unit_Of_Work.semesterWorkingWeek_Repository.First_Or_Default(d=>d.IsDeleted != true && d.ID == id);

            if (workingWeek == null)
            {
                return NotFound("No Working week with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Working Weeks", roleId, userId, workingWeek);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            workingWeek.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            workingWeek.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                workingWeek.DeletedByOctaId = userId;
                if (workingWeek.DeletedByUserId != null)
                {
                    workingWeek.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                workingWeek.DeletedByUserId = userId;
                if (workingWeek.DeletedByOctaId != null)
                {
                    workingWeek.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.semesterWorkingWeek_Repository.Update(workingWeek);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
