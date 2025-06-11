using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class AssignmentClassroomStudent : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [ForeignKey("Assignment")]
        public long AssignmentID { get; set; }
        public Assignment Assignment { get; set; }
        
        [ForeignKey("StudentClassroom")]
        public long StudentClassroomID { get; set; }
        public StudentClassroom StudentClassroom { get; set; }
    }
}
