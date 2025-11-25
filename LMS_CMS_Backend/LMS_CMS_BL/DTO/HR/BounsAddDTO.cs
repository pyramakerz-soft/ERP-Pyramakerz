using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class BonusAddDTO
    {
        public long? ID { get; set; }
        public DateOnly Date { get; set; }
        public int? NumberOfBonusDays { get; set; }
        public int? Hours { get; set; }
        public int? Minutes { get; set; }
        public long? Amount { get; set; }
        public string? Notes { get; set; }
        public long EmployeeID { get; set; }
        public long BonusTypeID { get; set; }
    }
}
