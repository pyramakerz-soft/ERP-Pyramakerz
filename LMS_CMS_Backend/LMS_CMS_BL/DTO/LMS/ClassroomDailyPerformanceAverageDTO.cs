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
        public double AverageScore { get; set; }
        //public int StudentCount { get; set; }
        public string PerformanceTypeEn { get; set; }
        public string PerformanceTypeAr { get; set; }
        public string Comment { get; set; }


        //public List<PerformanceDetail> PerformanceDetails { get; set; }
    }

    public class PerformanceDetail
    {
        
        

    }
}
