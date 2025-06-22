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
        public string Answer { get; set; }

        [ForeignKey("AssignmentStudent")]
        public long AssignmentStudentID { get; set; }
        public AssignmentStudent AssignmentStudent { get; set; }

        [ForeignKey("QuestionBank")]
        public long QuestionBankID { get; set; }
        public QuestionBank QuestionBank { get; set; }

        [ForeignKey("QuestionBankOption")]
        public long? AnswerOptionID { get; set; }
        public QuestionBankOption? QuestionBankOption { get; set; }
        public ICollection<AssignmentStudentQuestionAnswerOption>? AssignmentStudentQuestionAnswerOption { get; set; } = new HashSet<AssignmentStudentQuestionAnswerOption>();

    }
}
