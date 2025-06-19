using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class AssignmentStudentQuestionAddDTO
    {
        public string Answer { get; set; }
        public long QuestionBankID { get; set; }
        public long? AnswerOptionID { get; set; }
        public List<AssignmentStudentQuestionAnswerOptionAddDTO>? AssignmentStudentQuestionAnswerOption { get; set; }
    }
}
