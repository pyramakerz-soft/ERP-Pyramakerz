using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class VacationEmployeeAddDTO
    {
        public long? ID { get; set; }
        public DateOnly Date { get; set; }
        public string? Notes { get; set; }
        public bool HalfDay { get; set; }
        public DateOnly DateFrom { get; set; }
        public DateOnly? DateTo { get; set; }
        public long EmployeeID { get; set; }
        public long VacationTypesID { get; set; }
    }
}
