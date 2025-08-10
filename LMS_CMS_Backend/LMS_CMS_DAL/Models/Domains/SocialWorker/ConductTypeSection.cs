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
    public class ConductTypeSection : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [ForeignKey("ConductType")]
        public long ConductTypeID { get; set; }
        public ConductType ConductType { get; set; }

        [ForeignKey("Section")]
        public long SectionID { get; set; }
        public Section Section { get; set; }
    }
}
