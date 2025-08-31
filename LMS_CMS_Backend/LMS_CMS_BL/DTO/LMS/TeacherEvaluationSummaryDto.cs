using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class TeacherEvaluationSummaryDto
    {
        public DateOnly Date { get; set; }
        public long EmployeeId { get; set; }
        public string EmployeeEnglishName { get; set; } = "";
        public string EmployeeArabicName { get; set; } = "";
        public string OverallAverage { get; set; } = "0.00";
        //public string DepartmentName { get; set; } = "";
    }

}
