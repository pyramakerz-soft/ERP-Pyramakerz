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
        public long SubjectID { get; set; }
        public long StudentID { get; set; }
        public long GradeID { get; set; }
        public string SubjectName { get; set; }
        public string StudentName { get; set; }
        public string GradeName { get; set; }
        public List<StudentPerformanceAddDTO> StudentPerformance { get; set; }
    }
}
