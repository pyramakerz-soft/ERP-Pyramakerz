using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class AssignmentStudentAddDTOFile
    {
        //public float Degree { get; set; }
        public long AssignmentID { get; set; }
        public long StudentId { get; set; }
        public IFormFile? File { get; set; }
    }
}
