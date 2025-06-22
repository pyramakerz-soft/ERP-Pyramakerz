using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class StudentClassWhenSubject
    {  
        public long ClassroomID { get; set; }
        public string ClassroomName { get; set; }
        public List<StudentClassroomGetDTO> StudentClassrooms { get; set; } = new List<StudentClassroomGetDTO>();
    }
}
