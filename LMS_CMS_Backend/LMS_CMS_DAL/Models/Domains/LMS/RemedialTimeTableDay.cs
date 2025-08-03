using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class RemedialTimeTableDay : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public int PeriodIndex { get; set; }

        [ForeignKey("Day")]
        public long DayId { get; set; }
        public Days Day { get; set; }

        [ForeignKey("RemedialTimeTable")]
        public long RemedialTimeTableID { get; set; }
        public RemedialTimeTable RemedialTimeTable { get; set; }
        public ICollection<RemedialTimeTableClasses> RemedialTimeTableClasses { get; set; } = new HashSet<RemedialTimeTableClasses>();

    }
}
