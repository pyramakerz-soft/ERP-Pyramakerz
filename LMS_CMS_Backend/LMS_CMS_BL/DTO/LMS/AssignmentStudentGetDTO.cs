using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class AssignmentStudentGetDTO
    {
        public long? ID { get; set; }
        public float? Degree { get; set; }
        public float AssignmentDegree { get; set; }
        public DateOnly OpenDate { get; set; }
        public DateOnly DueDate { get; set; }
        public DateOnly CutOfDate { get; set; }
        public long AssignmentID { get; set; }
        public long AssignmentTypeID { get; set; }
        public long StudentClassroomID { get; set; }
        public string? LinkFile { get; set; }
        public bool IsVisibleToStudent { get; set; }

        public long ClassroomID { get; set; }
        public string ClassroomName { get; set; }

        public long StudentID { get; set; }
        public string StudentEnglishName { get; set; }
        public string StudentArabicName { get; set; }

        public long SubjectId { get; set; }
        public string SubjectName { get; set; }

        public string AssignmentArabicName { get; set; }
        public string AssignmentEnglishName { get; set; }

        public List<AssignmentStudentQuestionGetDTO> AssignmentStudentQuestions { get; set; }
    }
}
