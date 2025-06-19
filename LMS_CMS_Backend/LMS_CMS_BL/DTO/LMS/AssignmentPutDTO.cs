using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class AssignmentPutDTO
    {
        public long ID { get; set; }
        [Required(ErrorMessage = "English Name is required")]
        [StringLength(100, ErrorMessage = "English Name cannot be longer than 100 characters.")]
        public string EnglishName { get; set; }
        [Required(ErrorMessage = "Arabic Name is required")]
        [StringLength(100, ErrorMessage = "Arabic Name cannot be longer than 100 characters.")]
        public string ArabicName { get; set; }
        public float Mark { get; set; }
        public DateOnly OpenDate { get; set; }
        public DateOnly? DueDate { get; set; }
        public DateOnly CutOfDate { get; set; }
        public bool IsSpecificStudents { get; set; }
        public long SubjectID { get; set; }
        public long AssignmentTypeID { get; set; }
        public long SubjectWeightTypeID { get; set; }
        public List<long> StudentClassroomIDs { get; set; }
    }
}
