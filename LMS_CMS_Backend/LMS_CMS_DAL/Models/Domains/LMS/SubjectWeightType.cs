using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class SubjectWeightType : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        [ForeignKey("WeightType")]
        public long WeightTypeID { get; set; }
        public WeightType WeightType { get; set; }

        [ForeignKey("Subject")]
        public long SubjectID { get; set; }
        public Subject Subject { get; set; }

        public float Value { get; set; }

        public ICollection<Assignment> Assignments { get; set; } = new HashSet<Assignment>();
    }
}
