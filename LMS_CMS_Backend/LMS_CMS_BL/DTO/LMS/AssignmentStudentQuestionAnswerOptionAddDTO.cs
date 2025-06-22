using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class AssignmentStudentQuestionAnswerOptionAddDTO
    {
        public long Order { get; set; }
        public string Answer { get; set; }
        public long? AssignmentStudentQuestionID { get; set; }
        public long? SelectedOpionID { get; set; }
        public long? SubBankQuestionID { get; set; }
    }
}
