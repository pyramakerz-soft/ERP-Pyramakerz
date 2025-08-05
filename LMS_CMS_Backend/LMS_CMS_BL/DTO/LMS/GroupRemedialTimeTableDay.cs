using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class GroupRemedialTimeTableDay
    {
        public long DayId { get; set; }
        public string DayName { get; set; }
        public List<RemedialTimeTableDayGetDTO> Periods { get; set; }

    }
}
