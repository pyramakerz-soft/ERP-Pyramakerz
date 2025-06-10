using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class AssignmentQuestionAddDTO
    {
        public long AssignmentID { get; set; }
        public List<long>? QuestionIds { get; set; }
        public List<QuestionAssignmentTypeCountDTO>? QuestionAssignmentTypeCountDTO { get; set; }
        public IFormFile? File { get; set; }
    }
}
