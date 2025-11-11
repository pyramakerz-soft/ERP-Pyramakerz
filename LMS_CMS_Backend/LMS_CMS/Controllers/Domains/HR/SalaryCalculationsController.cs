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
using System;
using static System.Runtime.InteropServices.JavaScript.JSType;
using Org.BouncyCastle.Ocsp;

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
        public async Task<IActionResult> AddAllMonthlyAttendence(int month , int year , long employeeId =0)
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
            TimeSpan OvertimeStartAfterMinutes = TimeSpan.FromMinutes(salaryConfigration.OvertimeStartAfterMinutes);
            DateOnly periodStart = new DateOnly();
            DateOnly periodEnd = new DateOnly();

            if (salaryConfigration.FromPreviousMonth == false)
            {
                periodStart = new DateOnly(year, month, startDay);
                periodEnd = periodStart.AddMonths(1).AddDays(-1);
            }
            else
            {
                periodStart = new DateOnly(year, month, startDay).AddMonths(-1);
                periodEnd = new DateOnly(year, month, startDay).AddDays(-1);
            }

            // Get all employee 
            List<Employee> Allemployees = new List<Employee>();

            if (employeeId > 0)
            {
                var employee = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.ID == employeeId && e.IsDeleted != true);
                if (employee == null)
                {
                    return NotFound($"Employee with ID {employeeId} not found.");
                }
                Allemployees = new List<Employee> { employee };
            }
            else
            {
                Allemployees = Unit_Of_Work.employee_Repository.FindBy(e => e.IsDeleted != true);
            }

            // Validate each employee’s times
            foreach (var employee in Allemployees)
            {
               

                List<MonthlyAttendance> monthlyAttendances = Unit_Of_Work.monthlyAttendance_Repository.FindBy(a => a.EmployeeId == employee.ID && a.Day >= periodStart && a.Day <= periodEnd);
                if (monthlyAttendances != null && monthlyAttendances.Count > 0)
                {
                    Unit_Of_Work.monthlyAttendance_Repository.DeleteListAsync(monthlyAttendances);
                    Unit_Of_Work.SaveChanges();

                }

                List<SalaryHistory> AllSalaryHistory = Unit_Of_Work.salaryHistory_Repository.FindBy(m => m.Month == month && m.Year == year && m.EmployeeId == employee.ID);
                if (AllSalaryHistory != null && AllSalaryHistory.Count > 0)
                {
                    Unit_Of_Work.salaryHistory_Repository.DeleteListAsync(AllSalaryHistory);
                    Unit_Of_Work.SaveChanges();

                }

                List<EmployeeLoans> AllEmployeeLoans = Unit_Of_Work.employeeLoans_Repository.FindBy(m => m.Month == month && m.Year == year && m.EmployeeId == employee.ID);
                if (AllEmployeeLoans != null && AllEmployeeLoans.Count > 0)
                {
                    Unit_Of_Work.employeeLoans_Repository.DeleteListAsync(AllEmployeeLoans);
                    Unit_Of_Work.SaveChanges();

                }

            }

            // Filter employees with attendance enabled
            List<Employee> employees = Allemployees
                .Where(e => e.HasAttendance == true)
                .ToList();

            foreach (var employee in employees)
            {
                if (!DateTime.TryParse(employee.AttendanceTime, out DateTime parsedAttendance))
                {
                    return BadRequest($"Invalid AttendanceTime for employee {employee.ID}: {employee.AttendanceTime}");
                }

                if (!DateTime.TryParse(employee.DepartureTime, out DateTime parsedDeparture))
                {
                    return BadRequest($"Invalid DepartureTime for employee {employee.ID}: {employee.DepartureTime}");
                }

                TimeSpan attendanceTime = DateTime.Parse(employee.AttendanceTime).TimeOfDay;
                TimeSpan departureTime = DateTime.Parse(employee.DepartureTime).TimeOfDay;
                TimeSpan allowedStart = attendanceTime.Add(TimeSpan.FromMinutes((double)employee.DelayAllowance));

                TimeSpan fullDayHours;
                TimeSpan halfDayHours;

                // Check if the shift ends on the same date or next day
                if (departureTime < attendanceTime)
                {
                    // Example: 11 PM → 7 AM
                    fullDayHours = (TimeSpan.FromHours(24) - attendanceTime) + departureTime;
                }
                else
                {
                    // Example: 8 AM → 4 PM
                    fullDayHours = departureTime - attendanceTime;
                }

                // Calculate half-day hours
                halfDayHours = TimeSpan.FromHours(fullDayHours.TotalHours / 2);

                List<EmployeeDays> employeeDays = await Unit_Of_Work.employeeDays_Repository.Select_All_With_IncludesById<EmployeeDays>(d => d.EmployeeID == employee.ID && d.IsDeleted != true,
                query => query.Include(Master => Master.Day));

                List<string> dayNames = employeeDays.Select(s=>s.Day.Name).Distinct().ToList();

                for (var day = periodStart; day <= periodEnd; day = day.AddDays(1))
                {

                    MonthlyAttendance monthlyAttendance = new MonthlyAttendance();  
                    monthlyAttendance.EmployeeId = employee.ID;    
                    monthlyAttendance.Day = day;
                    // Example: check the day of week
                    DayOfWeek dayOfWeek = day.DayOfWeek;
                    string currentDayName = dayOfWeek.ToString();

                    List<EmployeeClocks> employeeClocks = new List<EmployeeClocks>();
                    if (departureTime < attendanceTime)  // if the day is 2025-10-30
                    {
                        TimeOnly attendanceTimeOnly = TimeOnly.Parse(employee.AttendanceTime);
                        TimeOnly departureTimeOnly = TimeOnly.Parse(employee.DepartureTime);

                        var startOfRange = day.ToDateTime(departureTimeOnly);
                        var endOfRange = day.AddDays(1).ToDateTime(departureTimeOnly);

                        employeeClocks = Unit_Of_Work.employeeClocks_Repository.FindBy(c =>
                            c.EmployeeID == employee.ID &&
                            c.ClockOut != null &&
                            c.IsDeleted != true &&
                            (
                                c.ClockIn >= startOfRange && c.ClockIn < endOfRange
                            )
                        ).ToList();
                    }
                    else
                    {
                        employeeClocks = Unit_Of_Work.employeeClocks_Repository.FindBy(c => c.EmployeeID == employee.ID && c.ClockOut != null &&  c.Date == day && c.IsDeleted != true);
                    }


                    if (dayNames.Contains(currentDayName))
                    {
                        OfficialHolidays officialHoliday = Unit_Of_Work.officialHolidays_Repository.First_Or_Default(o=>o.DateFrom <=  day && o.DateTo >= day && o.IsDeleted != true); 
                        if(officialHoliday != null) // OfficialHolidays
                        {
                            monthlyAttendance.DayStatusId = 4; ///////////////////////////////////////////////////////////////////////////////////// OfficialHolidays

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

                                monthlyAttendance.WorkingHours = totalWorked.Hours;
                                monthlyAttendance.WorkingMinutes = totalWorked.Minutes;
                                monthlyAttendance.OvertimeHours = (int)totalWorked.TotalHours;
                                monthlyAttendance.OvertimeMinutes = totalWorked.Minutes;
                            }
                            Unit_Of_Work.monthlyAttendance_Repository.Add(monthlyAttendance);
                            Unit_Of_Work.SaveChanges();
                        }
                        else // vacation
                        {
                            VacationEmployee vacationEmployee = Unit_Of_Work.vacationEmployee_Repository
                                .First_Or_Default(o =>((o.HalfDay == true && o.DateFrom == day) ||   // half-day vacation applies only on that exact day
                                    (o.HalfDay == false && o.DateFrom <= day && o.DateTo >= day) )&& o.IsDeleted != true);

                            if (vacationEmployee != null && vacationEmployee.HalfDay == true) // half day vacation
                            {
                                monthlyAttendance.DayStatusId = 3; ///////////////////////////////////////////////////////////////////////////////////// Vacation without deduction
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

                                    List<LeaveRequest> leaveRequests = Unit_Of_Work.leaveRequest_Repository.FindBy(l => l.EmployeeID == employee.ID && l.IsDeleted != true && l.Date == day);

                                    // Sum all leave request hours and minutes
                                    TimeSpan totalLeave = TimeSpan.Zero;
                                    if (leaveRequests != null && leaveRequests.Count > 0)
                                    {
                                        foreach (var req in leaveRequests)
                                        {
                                            totalLeave += new TimeSpan(req.Hours, req.Minutes, 0);
                                        }
                                        monthlyAttendance.LeaveRequestHours = totalLeave.Hours;
                                        monthlyAttendance.LeaveRequestMinutes = totalLeave.Minutes;
                                    }

                                    TimeSpan requiredWork = halfDayHours - totalLeave;

                                    if (totalWorked >= requiredWork) // overTime
                                    {
                                        TimeSpan OverTime = totalWorked - requiredWork;
                                        if(OverTime >= OvertimeStartAfterMinutes)
                                        {
                                            monthlyAttendance.OvertimeHours = OverTime.Hours;
                                            monthlyAttendance.OvertimeMinutes = OverTime.Minutes;
                                        }


                                    }
                                    else if((totalWorked.Add(TimeSpan.FromMinutes((double)employee.DelayAllowance))) < requiredWork)
                                    {
                                        TimeSpan deduction = requiredWork - totalWorked;
                                        monthlyAttendance.DeductionHours = deduction.Hours;
                                        monthlyAttendance.DeductionMinutes = deduction.Minutes;
                                    }

                                    monthlyAttendance.WorkingHours = totalWorked.Hours;
                                    monthlyAttendance.WorkingMinutes = totalWorked.Minutes;
                                    Unit_Of_Work.monthlyAttendance_Repository.Add(monthlyAttendance);
                                    Unit_Of_Work.SaveChanges();

                                }
                                else // he did not make any clock in halfday vacation 
                                {
                                    List<LeaveRequest> leaveRequests = Unit_Of_Work.leaveRequest_Repository.FindBy(l => l.EmployeeID == employee.ID && l.IsDeleted != true && l.Date == day);

                                    // Sum all leave request hours and minutes
                                    TimeSpan totalLeave = TimeSpan.Zero;
                                    if (leaveRequests != null && leaveRequests.Count > 0)
                                    {
                                        foreach (var req in leaveRequests)
                                        {
                                            totalLeave += new TimeSpan(req.Hours, req.Minutes, 0);
                                        }

                                        TimeSpan deduction = halfDayHours - totalLeave;
                                        monthlyAttendance.DeductionHours = deduction.Hours;
                                        monthlyAttendance.DeductionMinutes = deduction.Minutes;
                                        monthlyAttendance.LeaveRequestHours = totalLeave.Hours;
                                        monthlyAttendance.LeaveRequestMinutes = totalLeave.Minutes;
                                        Unit_Of_Work.monthlyAttendance_Repository.Add(monthlyAttendance);
                                        Unit_Of_Work.SaveChanges();
                                    }
                                    else
                                    {
                                        TimeSpan deduction = halfDayHours;
                                        monthlyAttendance.DeductionHours = deduction.Hours;
                                        monthlyAttendance.DeductionMinutes = deduction.Minutes;
                                        Unit_Of_Work.monthlyAttendance_Repository.Add(monthlyAttendance);
                                        Unit_Of_Work.SaveChanges();
                                    }
                                }
                            }
                            else if(vacationEmployee != null && vacationEmployee.HalfDay == false)
                            {
                                monthlyAttendance.DayStatusId = 3; ///////////////////////////////////////////////////////////////////////////////////// Vacation with out deduction
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
                                    monthlyAttendance.WorkingHours = totalWorked.Hours;
                                    monthlyAttendance.WorkingMinutes = totalWorked.Minutes;
                                    monthlyAttendance.OvertimeHours = (int)totalWorked.TotalHours;
                                    monthlyAttendance.OvertimeMinutes = totalWorked.Minutes;

                                }

                                Unit_Of_Work.monthlyAttendance_Repository.Add(monthlyAttendance);
                                Unit_Of_Work.SaveChanges();
                            }
                            else // he should be present
                            {

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
                                        TimeSpan requiredWork = fullDayHours - totalLeave;

                                        // Compare worked vs required
                                        if (totalWorked < requiredWork)
                                        {
                                            // Missing hours => late
                                            TimeSpan diff = requiredWork - totalWorked;
                                            monthlyAttendance.DeductionHours = diff.Hours;
                                            monthlyAttendance.DeductionMinutes = diff.Minutes;
                                        }
                                        else if (totalWorked > requiredWork)
                                        {
                                            // Overtime
                                            TimeSpan overtime = totalWorked - requiredWork;
                                            if (overtime >= OvertimeStartAfterMinutes)
                                            {
                                                monthlyAttendance.OvertimeHours = overtime.Hours;
                                                monthlyAttendance.OvertimeMinutes = overtime.Minutes;
                                            }
                                        }
                                        monthlyAttendance.LeaveRequestHours = totalLeave.Hours;
                                        monthlyAttendance.LeaveRequestMinutes = totalLeave.Minutes;
                                        monthlyAttendance.DayStatusId = 1;  ///////////////////////////////////////////////////////////////////////////////////// Present
                                        monthlyAttendance.WorkingHours = totalWorked.Hours;
                                        monthlyAttendance.WorkingMinutes = totalWorked.Minutes ;
                                    }
                                    else
                                    {
                                        // First actual ClockIn
                                        var firstClockIn = employeeClocks
                                            .Where(c => c.ClockIn.HasValue)
                                            .OrderBy(c => c.ClockIn)
                                            .FirstOrDefault()?.ClockIn;

                                        TimeSpan lateTime = TimeSpan.Zero;

                                        if (firstClockIn.HasValue && departureTime < attendanceTime) // midnight shift
                                        {
                                            TimeOnly attendanceTimeOnly = TimeOnly.FromTimeSpan(attendanceTime);

                                            DateTime allowedStartDateTime = day.ToDateTime(attendanceTimeOnly); 
                                            allowedStartDateTime = allowedStartDateTime.AddMinutes(employee.DelayAllowance ?? 0);
                                            DateTime attendanceDateTime = day.ToDateTime(attendanceTimeOnly);
                                            DateTime actualStart = firstClockIn.Value;

                                            if (actualStart > allowedStartDateTime)
                                            {
                                                // Employee came late
                                                lateTime = actualStart - attendanceDateTime;
                                                monthlyAttendance.DeductionHours = lateTime.Hours;
                                                monthlyAttendance.DeductionMinutes = lateTime.Minutes;
                                            }
                                            else if (actualStart <= allowedStartDateTime && actualStart > attendanceDateTime)
                                            {
                                                lateTime = actualStart - attendanceDateTime;
                                            }
                                        }
                                        else if(firstClockIn.HasValue && departureTime > attendanceTime) // morning shift
                                        {
                                            TimeSpan actualStart = firstClockIn.Value.TimeOfDay;
                                            if (actualStart > allowedStart)
                                            {
                                                // Employee came late
                                                lateTime = actualStart - attendanceTime;
                                                monthlyAttendance.DeductionHours = lateTime.Hours;
                                                monthlyAttendance.DeductionMinutes = lateTime.Minutes;
                                            }
                                            else if (actualStart <= allowedStart && actualStart > attendanceTime)
                                            {
                                                lateTime = actualStart - attendanceTime;
                                            }

                                        }

                                        TimeSpan requiredWork = fullDayHours - lateTime;

                                        // Compare worked vs required
                                        if (totalWorked < requiredWork)
                                        {
                                            // Missing hours => late
                                            TimeSpan diff = requiredWork - totalWorked;
                                            monthlyAttendance.DeductionHours += diff.Hours;
                                            monthlyAttendance.DeductionMinutes += diff.Minutes;
                                        }
                                        else if (totalWorked > requiredWork)
                                        {
                                            // Overtime
                                            TimeSpan overtime = totalWorked - requiredWork;
                                            if (overtime >= OvertimeStartAfterMinutes)
                                            {
                                                monthlyAttendance.OvertimeHours = overtime.Hours;
                                                monthlyAttendance.OvertimeMinutes = overtime.Minutes;
                                            }
                                        }
                                        monthlyAttendance.DayStatusId = 1;  ///////////////////////////////////////////////////////////////////////////////////// Present
                                        monthlyAttendance.WorkingHours = totalWorked.Hours;
                                        monthlyAttendance.WorkingMinutes = totalWorked.Minutes;
                                    }

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
                            monthlyAttendance.WorkingHours = totalWorked.Hours;
                            monthlyAttendance.WorkingMinutes = totalWorked.Minutes;
                            monthlyAttendance.OvertimeHours = (int)totalWorked.TotalHours;
                            monthlyAttendance.OvertimeMinutes = totalWorked.Minutes;

                        }
                        Unit_Of_Work.monthlyAttendance_Repository.Add(monthlyAttendance);
                        Unit_Of_Work.SaveChanges();

                    }

                }
            }
            if(employeeId == 0)
            {
               GenerateSalaryHistory(month, year , 0);
            }
            else
            {
               GenerateSalaryHistory(month, year, employeeId);
            }
            return Ok();
        }


        ////////////////////////////////
        private void GenerateSalaryHistory(int month, int year , long employeeId = 0)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            SalaryConfigration salaryConfigration = Unit_Of_Work.salaryConfigration_Repository
                .First_Or_Default(s => s.ID == 1);


            int startDay = salaryConfigration.StartDay;
            TimeSpan OvertimeStartAfterMinutes = TimeSpan.FromMinutes(salaryConfigration.OvertimeStartAfterMinutes);
            DateOnly periodStart = new DateOnly();
            DateOnly periodEnd = new DateOnly();

            if (salaryConfigration.FromPreviousMonth == false)
            {
                periodStart = new DateOnly(year, month, startDay);
                periodEnd = periodStart.AddMonths(1).AddDays(-1);
            }
            else
            {
                periodStart = new DateOnly(year, month, startDay).AddMonths(-1);
                periodEnd = new DateOnly(year, month, startDay).AddDays(-1);
            }

            List<Employee> employees = new List<Employee>();

            if (employeeId > 0)
            {
                var employee = Unit_Of_Work.employee_Repository.First_Or_Default(e => e.ID == employeeId && e.IsDeleted != true);
                employees = new List<Employee> { employee };
            }
            else
            {
                employees = Unit_Of_Work.employee_Repository.FindBy(e => e.IsDeleted != true);
            }

            foreach (var employee in employees)
            {
                TimeSpan attendanceTime = new TimeSpan();
                TimeSpan departureTime = new TimeSpan();
                TimeSpan fullDayHours = new TimeSpan();
                double totalDayHours = 0;
                double dailyRate = 0;
                double hourlyRate = 0;
                double minuteRate = 0;

                SalaryHistory salaryHistory = new SalaryHistory();
                salaryHistory.EmployeeId = employee.ID;
                salaryHistory.Month = month;
                salaryHistory.Year = year;
                salaryHistory.BasicSalary = employee.MonthSalary ??  0;

                if (employee.HasAttendance == true)
                {
                     attendanceTime = DateTime.Parse(employee.AttendanceTime).TimeOfDay;
                     departureTime = DateTime.Parse(employee.DepartureTime).TimeOfDay;

                    // Check if the shift ends on the same date or next day
                    if (departureTime < attendanceTime)
                    {
                        // Example: 11 PM → 7 AM
                        fullDayHours = (TimeSpan.FromHours(24) - attendanceTime) + departureTime;
                    }
                    else
                    {
                        // Example: 8 AM → 4 PM
                        fullDayHours = departureTime - attendanceTime;
                    }

                     totalDayHours = fullDayHours.TotalHours;
                     dailyRate = (double)employee.MonthSalary.Value / 30 ;
                     hourlyRate = (double)employee.MonthSalary.Value / 30 / totalDayHours;
                     minuteRate = hourlyRate / 60;

                    List<MonthlyAttendance> monthlyAttendances = Unit_Of_Work.monthlyAttendance_Repository.FindBy(m => m.EmployeeId == employee.ID && m.Day >= periodStart && m.Day <= periodEnd);

                    int totalDeductionHours = monthlyAttendances.Select(m => m.DeductionHours).Sum();
                    int totalDeductionMinutes = monthlyAttendances.Select(m => m.DeductionMinutes).Sum();
                    TimeSpan sunDeduction = TimeSpan.FromHours(totalDeductionHours) + TimeSpan.FromMinutes(totalDeductionMinutes);
                    salaryHistory.TotalDeductions = (decimal)(hourlyRate * sunDeduction.TotalHours);


                    int totalOverTimeHours = monthlyAttendances.Select(m => m.OvertimeHours).Sum();
                    int totalOverTimeMinutes = monthlyAttendances.Select(m => m.OvertimeMinutes).Sum();
                    TimeSpan sunOverTime = TimeSpan.FromHours(totalOverTimeHours) + TimeSpan.FromMinutes(totalOverTimeMinutes);
                    salaryHistory.TotalOvertime = (decimal)(hourlyRate * sunOverTime.TotalHours);

                    int totalAbsentDays = monthlyAttendances.Count(m => m.DayStatusId == 2);
                    salaryHistory.TotalDeductions += (decimal)(dailyRate * totalAbsentDays);

                }

                /// bouns
                List<Bouns> Allbouns = Unit_Of_Work.bouns_Repository.FindBy(m => m.Date >= periodStart && m.Date <= periodEnd && m.EmployeeID == employee.ID && m.IsDeleted != true);
                foreach (var item in Allbouns)
                {
                    if(item.BounsTypeID == 1) // hours
                    {
                        salaryHistory.TotalBonus += (decimal)((hourlyRate * item.Hours) + (minuteRate * item.Minutes));

                    }
                    else if(item.BounsTypeID == 2) // day
                    {
                        salaryHistory.TotalBonus += (decimal)(dailyRate * item.NumberOfBounsDays);
                    }
                    else if (item.BounsTypeID == 3) // Amount
                    {
                        salaryHistory.TotalBonus += (decimal)(item.Amount);

                    }
                }

                /// deduction
                List<Deduction> Alldeductions = Unit_Of_Work.deduction_Repository.FindBy(m => m.Date >= periodStart && m.Date <= periodEnd && m.EmployeeID == employee.ID && m.IsDeleted != true);
                foreach (var item in Alldeductions)
                {
                    if (item.DeductionTypeID == 1) // hours
                    {
                        salaryHistory.TotalDeductions += (decimal)((hourlyRate * item.Hours) + (minuteRate * item.Minutes));
                    }
                    else if (item.DeductionTypeID == 2) // day
                    {
                        salaryHistory.TotalDeductions += (decimal)(dailyRate * item.NumberOfDeductionDays);
                    }
                    else if (item.DeductionTypeID == 3) // Amount
                    {
                        salaryHistory.TotalDeductions += (decimal)(item.Amount);
                    }
                }

                /// Loans
                DateTime targetDate = new DateTime(year, month, startDay);

                List<Loans> Allloans = Unit_Of_Work.loans_Repository.FindBy(m => m.EmployeeID == employee.ID && m.IsDeleted != true &&
                    (m.DeductionStartYear < year ||
                    (m.DeductionStartYear == year && m.DeductionStartMonth <= month)) &&
                    (m.DeductionEndYear > year ||
                    (m.DeductionEndYear == year && m.DeductionEndMonth >= month))
                );

                foreach (var item in Allloans)
                {
                   EmployeeLoans employeeLoans = new EmployeeLoans();
                    employeeLoans.EmployeeId = employee.ID;
                    employeeLoans.loanId = item.ID;
                    employeeLoans.Year = year;
                    employeeLoans.Month = month;
                    employeeLoans.Amount = (decimal)(item.Amount / item.NumberOfDeduction);
                    Unit_Of_Work.employeeLoans_Repository.Add(employeeLoans);
                    Unit_Of_Work.SaveChanges();
                    salaryHistory.TotalLoans += employeeLoans.Amount;
                }

                salaryHistory.NetSalary = salaryHistory.BasicSalary - (salaryHistory.TotalLoans+ salaryHistory.TotalDeductions) + (salaryHistory.TotalBonus + salaryHistory.TotalOvertime);
                Unit_Of_Work.salaryHistory_Repository.Add(salaryHistory);
                Unit_Of_Work.SaveChanges();
            }
        }

        ////////////////////////////////
    }
}
