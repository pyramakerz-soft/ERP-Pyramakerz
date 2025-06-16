using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class Assignment : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        [Required(ErrorMessage = "English Name is required")]
        [StringLength(100, ErrorMessage = "English Name cannot be longer than 100 characters.")]
        public string EnglishName { get; set; }
        [Required(ErrorMessage = "Arabic Name is required")]
        [StringLength(100, ErrorMessage = "Arabic Name cannot be longer than 100 characters.")]
        public string ArabicName { get; set; }
        public float Mark { get; set; }
        public DateOnly OpenDate { get; set; }
        public DateOnly DueDate { get; set; }
        public DateOnly CutOfDate { get; set; }
        public bool IsSpecificStudents { get; set; }
        public string? LinkFile{ get; set; }

        [ForeignKey("Subject")]
        public long SubjectID { get; set; }
        public Subject Subject { get; set; }

        [ForeignKey("AssignmentType")]
        public long AssignmentTypeID { get; set; }
        public AssignmentType AssignmentType { get; set; }
     
        public ICollection<AssignmentQuestion> AssignmentQuestions { get; set; } = new HashSet<AssignmentQuestion>();
        public ICollection<AssignmentStudent> AssignmentStudents { get; set; } = new HashSet<AssignmentStudent>();
    }
}
