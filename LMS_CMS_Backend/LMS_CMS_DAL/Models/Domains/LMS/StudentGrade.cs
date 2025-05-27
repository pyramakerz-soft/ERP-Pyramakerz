using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class StudentGrade : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        [ForeignKey("Student")]
        public long StudentID { get; set; }
        [ForeignKey("Grade")]
        public long GradeID { get; set; }
        public Student Student { get; set; }
        public Grade Grade { get; set; }
    }
}
