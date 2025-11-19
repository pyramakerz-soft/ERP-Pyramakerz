using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class BonusReportDto
    {
        public long EmployeeId { get; set; }
        public string EmployeeEnName { get; set; }
        public string EmployeeArName { get; set; }

        public decimal TotalAmount { get; set; }
        public List<BonusGetDTO> Bonuses { get; set; } = new List<BonusGetDTO>();
    }
}
