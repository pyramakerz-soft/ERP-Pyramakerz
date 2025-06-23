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
    public class AssignmentStudentQuestionGetDTO
    {
        public long? ID { get; set; }
        public float Mark { get; set; }
        public float QuestionMark { get; set; }
        public string Answer { get; set; }

        public long AssignmentStudentID { get; set; }
        public long QuestionBankID { get; set; }

        public string QuestionDesc { get; set; }
        public string? QuestionImage { get; set; }
        public string? QuestionCorrectAnswerName { get; set; }

        public long QuestionTypeID { get; set; }
        public long QuestionCorrectAnswerID { get; set; }
        public string QuestionTypeName { get; set; }

        public long? AnswerOptionID { get; set; }

        public List<QuestionBankOptionAddDTO> QuestionBankOptions { get; set; }
        public List<SubBankQuestionAddDTO> SubBankQuestion { get; set; }
        public List<AssignmentStudentQuestionAnswerOptionGetDTO> AssignmentStudentQuestionAnswerOption { get; set; }
    }
}
