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
    public class Conduct : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public string? Details { get; set; }
        public DateOnly Date { get; set; }
        public bool IsSendSMSToParent { get; set; }
        public string? File { get; set; }

        [ForeignKey("Student")]
        public long StudentID { get; set; }
        public Student Student { get; set; }

        [ForeignKey("Classroom")]
        public long ClassroomID { get; set; }
        public Classroom Classroom { get; set; }

        [ForeignKey("ConductType")]
        public long ConductTypeID { get; set; }
        public ConductType ConductType { get; set; }

        [ForeignKey("ProcedureType")]
        public long ProcedureTypeID { get; set; }
        public ProcedureType ProcedureType { get; set; }

    }
}
