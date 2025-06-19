using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class AssignmentStudentQuestionAnswerOptionGetDTO
    {
        public long? ID { get; set; }
        public long Order { get; set; }
        public string Answer { get; set; }
        public long AssignmentStudentQuestionID { get; set; }
        public long? SelectedOpionID { get; set; }
        public long? SubBankQuestionID { get; set; }
    }
}
