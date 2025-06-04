using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO
{
    public class MultiParametersForStudentDTO
    {
        public long? ID { get; set; }
        public string? Name { get; set; }
        public string? NationalID { get; set; }
        public long? AcademicYearID { get; set; }
        public long? GradeID { get; set; }
        public long? ClassroomID { get; set; }
    }
}
