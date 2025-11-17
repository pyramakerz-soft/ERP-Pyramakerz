using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class DirectMarkClassesStudent : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public float? Degree { get; set; }

        [ForeignKey("DirectMark")]
        public long DirectMarkID { get; set; }
        public DirectMark DirectMark { get; set; }

        [ForeignKey("StudentClassroom")]
        public long StudentClassroomID { get; set; }
        public StudentClassroom StudentClassroom { get; set; }

    }
}
