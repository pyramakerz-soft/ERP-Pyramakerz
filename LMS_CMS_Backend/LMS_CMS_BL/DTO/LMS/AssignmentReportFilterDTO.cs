using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class AssignmentReportFilterDTO
    {
        public long SchoolId { get; set; }
        public long AcademicYearId { get; set; }
        public long GradeId { get; set; }
        public long SubjectId { get; set; }

        public DateOnly FromDate { get; set; }
        public DateOnly ToDate { get; set; }

    }
}
