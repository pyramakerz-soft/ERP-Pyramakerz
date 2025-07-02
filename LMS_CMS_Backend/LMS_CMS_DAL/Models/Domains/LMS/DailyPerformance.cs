using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class DailyPerformance : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public string? Comment { get; set; }

        [ForeignKey("Student")]
        public long StudentID { get; set; }
        public Student Student { get; set; }

        [ForeignKey("DailyPerformanceMaster")]
        public long DailyPerformanceMasterID { get; set; }
        public DailyPerformanceMaster DailyPerformanceMaster { get; set; }
        public ICollection<StudentPerformance> StudentPerformance { get; set; } = new HashSet<StudentPerformance>();
    }
}
