using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class AssignmentStudentQuestionAnswerOption : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public long Order { get; set; }
        public string Answer { get; set; }

        [ForeignKey("AssignmentStudentQuestion")]
        public long AssignmentStudentQuestionID { get; set; }
        public AssignmentStudentQuestion AssignmentStudentQuestion { get; set; }

        [ForeignKey("QuestionBankOption")]
        public long? SelectedOpionID { get; set; }
        public QuestionBankOption? QuestionBankOption { get; set; }

        [ForeignKey("SubBankQuestion")]
        public long? SubBankQuestionID { get; set; }
        public SubBankQuestion? SubBankQuestion { get; set; }
    }
}
