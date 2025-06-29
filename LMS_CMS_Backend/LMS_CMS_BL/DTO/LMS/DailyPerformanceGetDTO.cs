using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class DailyPerformanceGetDTO
    {
        public long ID { get; set; }
        public string? Comment { get; set; }
        public long StudentID { get; set; }
        public string StudentName { get; set; }
        public List<StudentPerformanceAddDTO> StudentPerformance { get; set; }
    }
}
