using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class DailyPerformanceReportDTO
    {
        public DateOnly Date { get; set; } 
        public long SchoolId { get; set; } 
        public long GradeId { get; set; } 
        public long ClassroomId { get; set; } 
        public string ClassroomName { get; set; }
        public long StudentId { get; set; } 
        public string EnglishNameStudent { get; set; } 
        public string ArabicNameStudent { get; set; } 
       
        public string PerformanceTypeEn { get; set; } 
        public string PerformanceTypeAr { get; set; } 
        public string Comment { get; set; }
       
    }
}
