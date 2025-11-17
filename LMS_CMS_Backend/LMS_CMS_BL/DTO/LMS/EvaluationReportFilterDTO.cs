using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class EvaluationReportFilterDTO
    {
        //public long? EvaluatorId { get; set; }
        //public long? EvaluatedId { get; set; }
        public long? EmployeeId { get; set; }
        public long? SchoolId { get; set; }
        public long? TemplateId { get; set; }
        public long? ClassroomId { get; set; }

        // الفترة (تاريخ البداية والنهاية)
        public DateOnly? FromDate { get; set; }
        public DateOnly? ToDate { get; set; }
    }
}
