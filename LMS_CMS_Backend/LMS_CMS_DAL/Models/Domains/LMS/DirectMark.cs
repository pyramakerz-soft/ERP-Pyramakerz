using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class DirectMark : AuditableEntity
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
        public DateOnly Date { get; set; }

        [ForeignKey("Subject")] 
        public long SubjectID { get; set; }
        public Subject Subject { get; set; }

        [ForeignKey("SubjectWeightType")]
        public long SubjectWeightTypeID { get; set; }
        public SubjectWeightType SubjectWeightType { get; set; }

        public ICollection<DirectMarkClasses> DirectMarkClasses { get; set; } = new HashSet<DirectMarkClasses>();
        public ICollection<DirectMarkClassesStudent> DirectMarkClassesStudent { get; set; } = new HashSet<DirectMarkClassesStudent>();
    }
}
