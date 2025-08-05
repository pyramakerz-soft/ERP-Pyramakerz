using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class RemedialClassroomEditDTOcs
    {
        public long ID { get; set; }
        public string Name { get; set; }
        public int NumberOfSession { get; set; }
        public long SubjectID { get; set; }
        public long AcademicYearID { get; set; }
        public long TeacherID { get; set; }
        public List<long> StudentsId { get; set; }
    }
}
