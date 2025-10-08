using LMS_CMS_DAL.Models.Domains.HR;
using LMS_CMS_DAL.Models.Domains;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class EmployeeClocksGetDTO
    {
        public long ID { get; set; }
        public DateOnly Date { get; set; }
        public TimeSpan? ClockIn { get; set; }
        public TimeSpan? ClockOut { get; set; }
        public long LocationID { get; set; }
        public string LocationName { get; set; }
        public long EmployeeID { get; set; }
        public string EmployeeEnName { get; set; }
        public string EmployeeArName { get; set; }

    }
}
