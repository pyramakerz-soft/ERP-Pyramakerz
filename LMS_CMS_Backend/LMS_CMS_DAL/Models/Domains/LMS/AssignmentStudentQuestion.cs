using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class AssignmentStudentQuestion : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public float Mark { get; set; }

        [ForeignKey("AssignmentStudent")]
        public long AssignmentStudentID { get; set; }
        public AssignmentStudent AssignmentStudent { get; set; }

    }
}
