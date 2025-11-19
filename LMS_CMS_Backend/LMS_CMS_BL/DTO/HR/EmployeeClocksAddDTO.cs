using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class EmployeeClocksAddDTO
    {
        public long? ID { get; set; }
        public DateOnly? Date { get; set; }
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public double? Latitude { get; set; }  
        public double? Longitude { get; set; }
        public long? LocationID { get; set; }
        public long? EmployeeID { get; set; }
    }
}
