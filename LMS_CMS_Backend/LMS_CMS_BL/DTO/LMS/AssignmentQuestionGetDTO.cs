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
    public class AssignmentQuestionGetDTO
    {
        public long ID { get; set; }
        public long AssignmentID { get; set; }
        public long QuestionBankID { get; set; }
        public QuestionBankGetDTO QuestionBank { get; set; }
    }
}
