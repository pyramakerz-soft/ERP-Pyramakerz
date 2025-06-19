using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class AssignmentStudentAddDTO
    {
        public float Degree { get; set; }
        public long AssignmentID { get; set; }
        public long StudentClassroomID { get; set; }
        public IFormFile File { get; set; }
        public List<AssignmentStudentQuestionAddDTO>? AssignmentStudentQuestions { get; set; }
    }
}
