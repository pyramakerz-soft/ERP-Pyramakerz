using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class ClassroomWithSubjectsDTO
    {
        public long ClassroomID { get; set; }
        public string ClassroomName { get; set; }  // Optional, if you want name
        public List<ClassroomSubjectGetDTO> Subjects { get; set; }
    }
}
