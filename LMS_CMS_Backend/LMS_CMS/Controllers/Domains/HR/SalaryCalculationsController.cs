using AutoMapper;
using LMS_CMS_BL.DTO.HR;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.HR;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_PL.Attribute;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using LMS_CMS_PL.Services;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.HR
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class SalaryCalculationsController : ControllerBase
    {

        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public SalaryCalculationsController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" } 
        )]
        public async Task<IActionResult> AddAllMonthlyAttendence(int month , int year)
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


            // Get all employee 
            List<Employee> employees = Unit_Of_Work.employee_Repository.FindBy(e => e.IsDeleted != true && e.HasAttendance == true);

            foreach (var employee in employees)
            {
                List<MonthlyAttendance> monthlyAttendances = Unit_Of_Work.monthlyAttendance_Repository.FindBy(a=>a.EmployeeId == employee.ID && a.Day >= periodStart && a.Day <= periodEnd);
                if(monthlyAttendances != null && monthlyAttendances.Count > 0)
                {
                    Unit_Of_Work.monthlyAttendance_Repository.DeleteListAsync(monthlyAttendances);
                    Unit_Of_Work.SaveChanges();

                }

                TimeSpan attendanceTime = DateTime.Parse(employee.AttendanceTime).TimeOfDay;
                TimeSpan departureTime = DateTime.Parse(employee.DepartureTime).TimeOfDay;
                TimeSpan allowedStart = attendanceTime.Add(TimeSpan.FromMinutes((double)employee.DelayAllowance));

                TimeSpan fullDayHours = departureTime - attendanceTime;
                TimeSpan halfDayHours = TimeSpan.FromHours(fullDayHours.TotalHours / 2);

                List<EmployeeDays> employeeDays =await Unit_Of_Work.employeeDays_Repository.Select_All_With_IncludesById<EmployeeDays>(d => d.EmployeeID == employee.ID && d.IsDeleted != true,
                query => query.Include(Master => Master.Day));

                List<string> dayNames = employeeDays.Select(s=>s.Day.Name).Distinct().ToList();

                for (var day = periodStart; day <= periodEnd; day = day.AddDays(1))
                {
                    Console.WriteLine($"Processing day: {day}");

                    MonthlyAttendance monthlyAttendance = new MonthlyAttendance();  
                    monthlyAttendance.EmployeeId = employee.ID;    
                    monthlyAttendance.Day = day;
                    // Example: check the day of week
                    DayOfWeek dayOfWeek = day.DayOfWeek;
                    string currentDayName = dayOfWeek.ToString();


                    if (dayNames.Contains(currentDayName))
                    {
                        OfficialHolidays officialHoliday = Unit_Of_Work.officialHolidays_Repository.First_Or_Default(o=>o.DateFrom <=  day && o.DateTo >= day); 
                        if(officialHoliday != null) // OfficialHolidays
                        {
                            monthlyAttendance.DayStatusId = 4; ///////////////////////////////////////////////////////////////////////////////////// OfficialHolidays

                            // check if he work in OfficialHolidays 
                            List<EmployeeClocks> employeeClocks = Unit_Of_Work.employeeClocks_Repository.FindBy(c => c.EmployeeID == employee.ID && c.Date == day && c.IsDeleted != true);
                            if (employeeClocks != null && employeeClocks.Count > 0)
                            {
                                TimeSpan totalWorked = TimeSpan.Zero;

                                foreach (var clock in employeeClocks)
                                {
                                    if (clock.ClockIn != null && clock.ClockOut != null)
                                    {
                                        totalWorked += clock.ClockOut.Value - clock.ClockIn.Value;
                                    }
                                }

                                monthlyAttendance.OvertimeHours = (int)totalWorked.TotalHours;
                                monthlyAttendance.OvertimeMinutes = totalWorked.Minutes;
                            }
                            Unit_Of_Work.monthlyAttendance_Repository.Add(monthlyAttendance);
                            Unit_Of_Work.SaveChanges();
                        }
                        else // vacation
                        {
                            VacationEmployee vacationEmployee = Unit_Of_Work.vacationEmployee_Repository.First_Or_Default(o => ( o.DateFrom <= day && o.HalfDay == true) || (o.DateFrom <= day && o.DateTo >= day && o.HalfDay == false));
                            if(vacationEmployee != null && vacationEmployee.HalfDay == true) // half day vacation
                            {
                                List<EmployeeClocks> employeeClocks = Unit_Of_Work.employeeClocks_Repository.FindBy(c => c.EmployeeID == employee.ID && c.Date == day && c.IsDeleted != true);
                                if (employeeClocks != null && employeeClocks.Count > 0)
                                {
                                    TimeSpan totalWorked = TimeSpan.Zero;

                                    foreach (var clock in employeeClocks)
                                    {
                                        if (clock.ClockIn != null && clock.ClockOut != null)
                                        {
                                            totalWorked += clock.ClockOut.Value - clock.ClockIn.Value;
                                        }
                                    }


                                    if (totalWorked >= halfDayHours)
                                    {
                                        monthlyAttendance.DayStatusId = 3; ///////////////////////////////////////////////////////////////////////////////////// Vacation with out deduction
                                        monthlyAttendance.WorkingHours = totalWorked.Hours + (totalWorked.Minutes / 100.0);
                                        Unit_Of_Work.monthlyAttendance_Repository.Add(monthlyAttendance);
                                        Unit_Of_Work.SaveChanges();
                                    }
                                    else
                                    {

                                    }

                                    Unit_Of_Work.monthlyAttendance_Repository.Add(monthlyAttendance);
                                    Unit_Of_Work.SaveChanges();

                                }
                            }else if(vacationEmployee != null && vacationEmployee.HalfDay == false)
                            {
                                monthlyAttendance.DayStatusId = 3; ///////////////////////////////////////////////////////////////////////////////////// Vacation with out deduction
                                Unit_Of_Work.monthlyAttendance_Repository.Add(monthlyAttendance);
                                Unit_Of_Work.SaveChanges();
                            }
                            else // he should be present
                            {
                                // check if he work in weekend 
                                List<EmployeeClocks> employeeClocks = Unit_Of_Work.employeeClocks_Repository.FindBy(c => c.EmployeeID == employee.ID && c.Date == day && c.IsDeleted != true);
                                if (employeeClocks != null && employeeClocks.Count > 0)
                                {
                                    TimeSpan totalWorked = TimeSpan.Zero;

                                    foreach (var clock in employeeClocks)
                                    {
                                        if (clock.ClockIn != null && clock.ClockOut != null)
                                        {
                                            totalWorked += clock.ClockOut.Value - clock.ClockIn.Value;
                                        }
                                    }

                                    List<LeaveRequest> leaveRequests = Unit_Of_Work.leaveRequest_Repository.FindBy(l=>l.EmployeeID==employee.ID && l.IsDeleted != true && l.Date ==day );

                                    // Sum all leave request hours and minutes
                                    TimeSpan totalLeave = TimeSpan.Zero;
                                    if (leaveRequests != null && leaveRequests.Count > 0)
                                    {
                                        foreach (var req in leaveRequests)
                                        {
                                            totalLeave += new TimeSpan(req.Hours, req.Minutes, 0);
                                        }
                                    }

                                    // Expected working duration (e.g. 8h - leave)
                                    TimeSpan requiredWork = fullDayHours - totalLeave;

                                    // First actual ClockIn
                                    var firstClockIn = employeeClocks
                                        .Where(c => c.ClockIn.HasValue)
                                        .OrderBy(c => c.ClockIn)
                                        .FirstOrDefault()?.ClockIn;

                                    if (firstClockIn.HasValue)
                                    {
                                        TimeSpan actualStart = firstClockIn.Value;

                                        if (actualStart > allowedStart)
                                        {
                                            // Employee came late
                                            TimeSpan lateTime = actualStart - allowedStart;
                                            monthlyAttendance.LateHours = lateTime.Hours;
                                            monthlyAttendance.LateMinutes = lateTime.Minutes;
                                        }
                                    }

                                    // Compare worked vs required
                                    if (totalWorked < requiredWork)
                                    {
                                        // Missing hours => late
                                        TimeSpan diff = requiredWork - totalWorked;
                                        monthlyAttendance.LateHours = diff.Hours;
                                        monthlyAttendance.LateMinutes = diff.Minutes;
                                    }
                                    else if (totalWorked > requiredWork)
                                    {
                                        // Overtime
                                        TimeSpan overtime = totalWorked - requiredWork;
                                        monthlyAttendance.OvertimeHours = overtime.Hours;
                                        monthlyAttendance.OvertimeMinutes = overtime.Minutes;
                                    }
                                    monthlyAttendance.LeaveRequestHours = totalLeave.Hours;
                                    monthlyAttendance.LeaveRequestMinutes = totalLeave.Minutes;
                                    monthlyAttendance.DayStatusId = 1;  ///////////////////////////////////////////////////////////////////////////////////// Present
                                    monthlyAttendance.WorkingHours = totalWorked.Hours + (totalWorked.Minutes / 100.0);
                                    Unit_Of_Work.monthlyAttendance_Repository.Add(monthlyAttendance);
                                    Unit_Of_Work.SaveChanges();

                                }
                                else
                                {
                                    // No clock-in: Absent
                                    monthlyAttendance.DayStatusId = 2; ///////////////////////////////////////////////////////////////////////////////////// Absent
                                    Unit_Of_Work.monthlyAttendance_Repository.Add(monthlyAttendance);
                                    Unit_Of_Work.SaveChanges();
                                }
                            }
                        }
                    }
                    else
                    {
                        monthlyAttendance.DayStatusId = 5; ///////////////////////////////////////////////////////////////////////////////////// weekend

                        // check if he work in weekend 
                        List<EmployeeClocks> employeeClocks = Unit_Of_Work.employeeClocks_Repository.FindBy(c=>c.EmployeeID == employee.ID && c.Date == day && c.IsDeleted != true);
                        if(employeeClocks != null && employeeClocks.Count > 0)
                        {
                            TimeSpan totalWorked = TimeSpan.Zero;

                            foreach (var clock in employeeClocks)
                            {
                                if (clock.ClockIn != null && clock.ClockOut != null)
                                {
                                    totalWorked += clock.ClockOut.Value - clock.ClockIn.Value;
                                }
                            }

                            monthlyAttendance.OvertimeHours = (int)totalWorked.TotalHours;
                            monthlyAttendance.OvertimeMinutes = totalWorked.Minutes;

                        }
                        Unit_Of_Work.monthlyAttendance_Repository.Add(monthlyAttendance);
                        Unit_Of_Work.SaveChanges();

                    }

                }
            }

            return Ok();
        }


        ////////////////////////////////
        [HttpPost("AddAllSalaryHistory")]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" }
        )]
        public async Task<IActionResult> AddAllSalaryHistory(int month, int year)
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


            // Get all employee 
            List<Employee> HasAttendanceEmployees = Unit_Of_Work.employee_Repository.FindBy(e => e.IsDeleted != true && e.HasAttendance == true);


            return Ok();
        }

    }
}
