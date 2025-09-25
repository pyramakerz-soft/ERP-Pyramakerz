using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.HR
{
    public class MonthlyAttendance : AuditableEntity
    {
        public long Id { get; set; }

        public DateOnly Day { get; set; }
        public double WorkingHours { get; set; } 
        public int LateHours { get; set; }
        public int LateMinutes { get; set; }
        public int OvertimeHours { get; set; }
        public int OvertimeMinutes { get; set; }
        public int LeaveRequestHours { get; set; }
        public int LeaveRequestMinutes { get; set; }

        public long EmployeeId { get; set; }
        public Employee Employee { get; set; }

        public long DayStatusId { get; set; }
        public DayStatus DayStatus { get; set; }


    }
}
