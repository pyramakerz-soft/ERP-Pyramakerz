using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.SocialWorker
{
    public class ConductType : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string en_name { get; set; }

        [Required(ErrorMessage = "الاسم مطلوب")]
        [StringLength(100, ErrorMessage = "لا يمكن أن يكون الاسم أطول من 100 حرف")]
        public string ar_name { get; set; }

        [ForeignKey("ConductLevel")]
        public long ConductLevelID { get; set; }
        public ConductLevel ConductLevel { get; set; }

        [ForeignKey("School")]
        public long SchoolID { get; set; }
        public School School { get; set; }

        public ICollection<ConductTypeSection> ConductTypeSections { get; set; } = new HashSet<ConductTypeSection>();
        public ICollection<Conduct> Conduct { get; set; } = new HashSet<Conduct>();
    }
}
