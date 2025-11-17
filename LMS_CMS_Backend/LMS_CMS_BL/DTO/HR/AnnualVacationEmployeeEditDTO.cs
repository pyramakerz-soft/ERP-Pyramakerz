using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class AnnualVacationEmployeeEditDTO
    {
        public long ID { get; set; }
        public int Balance { get; set; }
        public long EmployeeID { get; set; }
        public long VacationTypesID { get; set; }
    }
}
