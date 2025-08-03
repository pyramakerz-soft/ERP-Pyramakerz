using LMS_CMS_DAL.Models.Domains;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class RemedialTimeTableDayGetDTO
    {
        public long ID { get; set; }
        public int PeriodIndex { get; set; }
        public long DayId { get; set; }
        public string DayName { get; set; }

    }
}
