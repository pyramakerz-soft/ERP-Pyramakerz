using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class SubjectTeacherDTO
    {
        public long SubjectId { get; set; }
        public string SubjectName { get; set; }
        public long TeacherId { get; set; }
        public string TeacherName { get; set; }
    }
}
