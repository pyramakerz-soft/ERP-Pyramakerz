using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class AssignmentQuestion : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [ForeignKey("Assignment")]
        public long AssignmentID { get; set; }
        public Assignment Assignment { get; set; }

        [ForeignKey("QuestionBank")]
        public long QuestionBankID { get; set; }
        public QuestionBank QuestionBank { get; set; }
    }
}
