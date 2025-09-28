using AutoMapper;
using LMS_CMS_BL.DTO.HR;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.HR;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace LMS_CMS_PL.Controllers.Domains.HR
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class EmployeeClocksController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public EmployeeClocksController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////

        [HttpGet("ByMonth/{EmpId}/{year}/{month}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Edit Attendance" }
        )]
        public IActionResult GetByMonth(long EmpId ,int year, int month)
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

            SalaryConfigration salaryConfigration = Unit_Of_Work.salaryConfigration_Repository
                 .First_Or_Default(s => s.ID == 1);

            if (salaryConfigration == null)
            {
                return BadRequest("Salary configuration not found.");
            }

            int startDay = salaryConfigration.StartDay;
            DateOnly periodStart = new DateOnly();
            DateOnly periodEnd = new DateOnly();

            if (salaryConfigration.FromPreviousMonth == false)
            {
                periodStart = new DateOnly(year, month, startDay);
                periodEnd = periodStart.AddMonths(1).AddDays(-1); // last day of month
            }
            else
            {
                 periodStart = new DateOnly(year, month, startDay).AddMonths(-1);
                 periodEnd = new DateOnly(year, month, startDay).AddDays(-1);
            }

            var employeeClocks = Unit_Of_Work.employeeClocks_Repository
                .FindBy(t => t.IsDeleted != true && t.Date >= periodStart && t.Date <= periodEnd && t.EmployeeID == EmpId );

            if (employeeClocks == null || employeeClocks.Count == 0)
            {
                return NotFound("No employee clocks found for this period.");
            }

            List<EmployeeClocksGetDTO> dto = mapper.Map<List<EmployeeClocksGetDTO>>(employeeClocks);

            return Ok(dto);
        }

        ////////////////////////////////

        [HttpGet("GetByMonthByToken/{year}/{month}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }
        )]
        public IActionResult GetByMonthByToken(int year, int month)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized(new { error = "User ID or Type claim not found." });
            }

            long EmpId = long.Parse(userIdClaim);
            SalaryConfigration salaryConfigration = Unit_Of_Work.salaryConfigration_Repository
                 .First_Or_Default(s => s.ID == 1);

            if (salaryConfigration == null)
            {
                return BadRequest(new { error = "Salary configuration not found." });
            }

            int startDay = salaryConfigration.StartDay;
            DateOnly periodStart = new DateOnly();
            DateOnly periodEnd = new DateOnly();

            if (salaryConfigration.FromPreviousMonth == false)
            {
                periodStart = new DateOnly(year, month, startDay);
                periodEnd = periodStart.AddMonths(1).AddDays(-1); // last day of month
            }
            else
            {
                periodStart = new DateOnly(year, month, startDay).AddMonths(-1);
                periodEnd = new DateOnly(year, month, startDay).AddDays(-1);
            }

            var employeeClocks = Unit_Of_Work.employeeClocks_Repository
                .FindBy(t => t.IsDeleted != true && t.Date >= periodStart && t.Date <= periodEnd && t.EmployeeID == EmpId);

            if (employeeClocks == null || employeeClocks.Count == 0)
            {
                return NotFound(new { error = "No employee clocks found for this period." });
            }

            List<EmployeeClocksGetDTO> dto = mapper.Map<List<EmployeeClocksGetDTO>>(employeeClocks);

            return Ok(dto);
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Edit Attendance" }
         )]
        public async Task<IActionResult> Add(EmployeeClocksAddDTO NewClock)
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
            if (NewClock == null)
            {
                return BadRequest("Clock is empty");
            }

            if (NewClock.LocationID == 0)
            {
                NewClock.LocationID = null;
            }

            if(NewClock.ClockIn == null || NewClock.ClockOut== null)
            {
                return BadRequest("ClockIn and ClockOut are required");
            }

            if (NewClock.ClockIn > NewClock.ClockOut)
            {
                return BadRequest("ClockIn and ClockOut are required");
            }

            EmployeeClocks clock = mapper.Map<EmployeeClocks>(NewClock);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            clock.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                clock.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                clock.InsertedByUserId = userId;
            }
            Unit_Of_Work.employeeClocks_Repository.Add(clock);
            Unit_Of_Work.SaveChanges();

            return Ok(NewClock);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Edit Attendance" }
        )]
        public async Task<IActionResult> EditAsync(List<EmployeeClocksAddDTO> NewClocks)
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

            foreach (var NewClock in NewClocks)
            {
                if (NewClock == null)
                {
                    return BadRequest("NewClock cannot be null");
                }

                if (NewClock.ID == null)
                {
                    return BadRequest("id can not be null");
                }

                EmployeeClocks clock = Unit_Of_Work.employeeClocks_Repository.First_Or_Default(s => s.ID == NewClock.ID && s.IsDeleted != true);
                if (clock == null)
                {
                    return BadRequest("clock not exist");
                }

                if (userTypeClaim == "employee")
                {
                    IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Edit Attendance", roleId, userId, clock);
                    if (accessCheck != null)
                    {
                        return accessCheck;
                    }
                }
                if ( NewClock.LocationID == 0)
                {
                    NewClock.LocationID = null;
                }
                mapper.Map(NewClock, clock);
                TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                clock.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    clock.UpdatedByOctaId = userId;
                    if (clock.UpdatedByUserId != null)
                    {
                        clock.UpdatedByUserId = null;
                    }
                }
                else if (userTypeClaim == "employee")
                {
                    clock.UpdatedByUserId = userId;
                    if (clock.UpdatedByOctaId != null)
                    {
                        clock.UpdatedByOctaId = null;
                    }
                }
                Unit_Of_Work.employeeClocks_Repository.Update(clock);
                Unit_Of_Work.SaveChanges();
            }

            return Ok(NewClocks);
        }

        ////////////////////////////////

        [HttpPost("AddClockIn")]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" }
      )]
        public async Task<IActionResult> AddClockIn(EmployeeClocksAddDTO NewClock)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized(new { error = "User ID or Type claim not found." });
            }
            if (NewClock == null)
            {
                return  BadRequest(new { error = "Clock is empty" });
            }

            NewClock.EmployeeID = long.Parse(userIdClaim);

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(s=>s.ID == NewClock.EmployeeID && s.IsDeleted != true);
            if (employee == null)
            {
                return BadRequest(new { error = "No Employee With This Id" });
            }

            EmployeeClocks employeeClocks = Unit_Of_Work.employeeClocks_Repository
                .FindBy(e => e.IsDeleted != true && e.EmployeeID == NewClock.EmployeeID && e.ClockOut == null)   // still open, no clock out
                .OrderByDescending(e => e.Date)
                .ThenByDescending(e => e.ClockIn)
                .FirstOrDefault();

            if (employeeClocks != null)
            {
                return BadRequest(new { error = "this user already clocked In" });
            }

            if (employee.IsRestrictedForLoctaion)
            {

                if(NewClock.Latitude == null)
                {
                    return BadRequest(new { error = "Latitude is Required" });
                }

                if (NewClock.Latitude == null)
                {
                    return BadRequest(new { error = "Latitude is Required" });
                }

                if (NewClock.LocationID == null || NewClock.LocationID == 0)
                {
                    return BadRequest(new { error = "LocationID is Required" });
                }

                Location location = Unit_Of_Work.location_Repository.First_Or_Default(s => s.ID == NewClock.LocationID && s.IsDeleted != true);
                if (location == null)
                {
                    return BadRequest(new { error = "No location With This Id" });
                }

                List<EmployeeLocation> employeeLocations = Unit_Of_Work.employeeLocation_Repository.FindBy(e => e.EmployeeID == employee.ID && e.IsDeleted != true);
                if (employeeLocations == null || employeeLocations.Count == 0)
                {
                    return BadRequest(new { error = "this employee not assigned for any location" });
                }

                List<long> locationsIds= employeeLocations.Select(e=>e.LocationID).Distinct().ToList();

                if(NewClock.LocationID != null && NewClock.LocationID != 0)
                {
                    if (locationsIds.Contains((long)NewClock.LocationID))
                    {
                        // compare lat and long
                        double distance = GetDistanceInMeters(
                            (double)NewClock.Latitude, (double)NewClock.Longitude,
                            location.Latitude, location.Longitude
                        );

                        if (distance > location.Range)
                        {
                            return BadRequest(new { error = $"Employee is out of range. Allowed: {location.Range} meters, Current: {distance:F2} meters" });
                        }
                    }
                    else
                    {
                        return BadRequest(new { error = "this employee not assigned for this location" });
                    }
                }
                else
                {
                    return BadRequest(new { error = "Location Id Is Required" });
                }
            }
            else
            {
                NewClock.LocationID= null;
            }

            EmployeeClocks clock = mapper.Map<EmployeeClocks>(NewClock);

            clock.Date = DateOnly.FromDateTime(DateTime.Now);   // today
            clock.ClockIn = DateTime.Now.TimeOfDay;             // current time
            clock.ClockOut = null;                              // default until they clock out

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            clock.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                clock.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                clock.InsertedByUserId = userId;
            }
            Unit_Of_Work.employeeClocks_Repository.Add(clock);
            Unit_Of_Work.SaveChanges();

            return Ok(NewClock);
        }

        ////////////////////////////////

        [HttpPost("AddClockOut")]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" }
        )]
        public async Task<IActionResult> AddClockOut(EmployeeClocksAddDTO NewClock)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized(new { error = "User ID or Type claim not found." });
            }
            if (NewClock == null)
            {
                return BadRequest(new { error = "Clock is empty" });
            }

            NewClock.EmployeeID = long.Parse(userIdClaim);

            Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(s => s.ID == NewClock.EmployeeID && s.IsDeleted != true);
            if (employee == null)
            {
                return BadRequest(new { error = "No Employee With This Id" });
            }

            if (employee.IsRestrictedForLoctaion)
            {
                if (NewClock.Latitude == null)
                {
                    return BadRequest(new { error = "Latitude is Required" });
                }

                if (NewClock.Latitude == null)
                {
                    return BadRequest(new { error = "Latitude is Required" });
                }

                if (NewClock.LocationID == null || NewClock.LocationID == 0)
                {
                    return BadRequest(new { error = "LocationID is Required" });
                }

                Location location = Unit_Of_Work.location_Repository.First_Or_Default(s => s.ID == NewClock.LocationID && s.IsDeleted != true);
                if (location == null)
                {
                    return BadRequest(new { error = "No location With This Id" });
                }

                List<EmployeeLocation> employeeLocations = Unit_Of_Work.employeeLocation_Repository.FindBy(e => e.EmployeeID == employee.ID && e.IsDeleted != true);
                if (employeeLocations == null || employeeLocations.Count == 0)
                {
                    return BadRequest(new { error = "this employee not assigned for any location" });
                }

                List<long> locationsIds = employeeLocations.Select(e => e.LocationID).Distinct().ToList();

                if (NewClock.LocationID != null && NewClock.LocationID != 0)
                {
                    if (locationsIds.Contains((long)NewClock.LocationID))
                    {
                        // compare lat and long
                        double distance = GetDistanceInMeters(
                            (double)NewClock.Latitude, (double)NewClock.Longitude,
                            location.Latitude, location.Longitude
                        );

                        if (distance > location.Range)
                        {
                            return BadRequest(new { error = $"Employee is out of range. Allowed: {location.Range} meters, Current: {distance:F2} meters" });
                        }
                    }
                    else
                    {
                        return BadRequest(new { error = "this employee not assigned for this location" });
                    }
                }
                else
                {
                    return BadRequest(new { error = "Location Id Is Required" });
                }
            }
            else
            {
                NewClock.LocationID = null;
            }

            EmployeeClocks clock = Unit_Of_Work.employeeClocks_Repository
                .FindBy(e => e.IsDeleted != true && e.EmployeeID == NewClock.EmployeeID && e.ClockOut == null)   // still open, no clock out
                .OrderByDescending(e => e.Date)
                .ThenByDescending(e => e.ClockIn)
                .FirstOrDefault();

            if(clock == null)
            {
                return BadRequest(new { error = "this user already clock out" });
            }

            clock.ClockOut = DateTime.Now.TimeOfDay;             // current time

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            clock.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                clock.UpdatedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                clock.UpdatedByUserId = userId;
            }

            Unit_Of_Work.employeeClocks_Repository.Update(clock);
            Unit_Of_Work.SaveChanges();

            return Ok(NewClock);
        }

        ////////////////////////////////

        private double GetDistanceInMeters(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371000; // Earth radius in meters
            var latRad1 = Math.PI * lat1 / 180.0;
            var latRad2 = Math.PI * lat2 / 180.0;
            var deltaLat = Math.PI * (lat2 - lat1) / 180.0;
            var deltaLon = Math.PI * (lon2 - lon1) / 180.0;

            var a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
                    Math.Cos(latRad1) * Math.Cos(latRad2) *
                    Math.Sin(deltaLon / 2) * Math.Sin(deltaLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c; // distance in meters
        }

    }
}
