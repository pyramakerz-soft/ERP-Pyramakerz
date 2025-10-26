using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class ClassroomDailyPerformanceAverageDTO
    {
        public DateOnly Date { get; set; }
        public string ClassroomName { get; set; } = string.Empty;
        public List<StudentPerformanceDTO> StudentPerformance { get; set; } = new();
    }
    public class StudentPerformanceDTO
    {
        public long PerformanceTypeID { get; set; }
        public string PerformanceTypeEn { get; set; } = string.Empty;
        public string PerformanceTypeAr { get; set; } = string.Empty;
        public double AverageScore { get; set; }
    }
}
