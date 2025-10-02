using LMS_CMS_DAL.Models.Domains;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class MonthlyAttendanceGetDTO 
    {
        public long Id { get; set; }

        public DateOnly Day { get; set; }
        public int WorkingHours { get; set; }
        public int WorkingMinutes { get; set; }
        public int DeductionHours { get; set; }
        public int DeductionMinutes { get; set; }
        public int OvertimeHours { get; set; }
        public int OvertimeMinutes { get; set; }
        public int LeaveRequestHours { get; set; }
        public int LeaveRequestMinutes { get; set; }

        public long EmployeeId { get; set; }
        public string EmployeeEnName { get; set; }
        public string EmployeeArName { get; set; }
        public long DayStatusId { get; set; }
        public string DayStatusName { get; set; }

    }
}
