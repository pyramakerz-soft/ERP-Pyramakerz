using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class GradeGroupDTO
    {
        public long GradeId { get; set; }
        public string GradeName { get; set; }
        public List<ClassroomGroupDTO> Classrooms { get; set; }
    }
}
