using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO
{
    public class EmployeeReportRequestDto
    {
        public long? JobId { get; set; }

        public long? JobCategoryId { get; set; }


    }
}
