using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class RemedialTimeTableClasses : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [ForeignKey("RemedialTimeTableDay")]
        public long RemedialTimeTableDayId { get; set; }
        public RemedialTimeTableDay RemedialTimeTableDay { get; set; }

        [ForeignKey("RemedialClassroom")]
        public long RemedialClassroomID { get; set; }
        public RemedialClassroom RemedialClassroom { get; set; }

        public static implicit operator List<object>(RemedialTimeTableClasses v)
        {
            throw new NotImplementedException();
        }
    }
}
