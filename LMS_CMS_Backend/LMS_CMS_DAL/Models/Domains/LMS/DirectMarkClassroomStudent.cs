using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class DirectMarkClassroomStudent : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public float Mark { get; set; }

        [ForeignKey("WeightType")]
        public long WeightTypeID { get; set; }
        public WeightType WeightType { get; set; }

        [ForeignKey("StudentClassroom")]
        public long StudentClassroomID { get; set; }
        public StudentClassroom StudentClassroom { get; set; }
    }
}
