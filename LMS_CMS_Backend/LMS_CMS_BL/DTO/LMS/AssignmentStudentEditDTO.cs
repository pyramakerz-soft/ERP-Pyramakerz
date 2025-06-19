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
    public class AssignmentStudentEditDTO
    {
        public long ID { get; set; }
        public float? Degree { get; set; }
        public ICollection<AssignmentStudentQuestionEditDTO> AssignmentStudentQuestions { get; set; }
    }
}
