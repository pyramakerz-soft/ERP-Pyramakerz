using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class RemedialClassroomStudent : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [ForeignKey("RemedialClassroom")]
        public long RemedialClassroomID { get; set; }
        public RemedialClassroom RemedialClassroom { get; set; }

        [ForeignKey("Student")]
        public long StudentID { get; set; }
        public Student Student { get; set; }
    }
}
