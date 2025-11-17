using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class FailedStudents : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [ForeignKey("Student")]  
        public long StudentID { get; set; }
        public Student Student { get; set; }

        [ForeignKey("Grade")]
        public long GradeID { get; set; }
        public Grade Grade { get; set; }

        [ForeignKey("Subject")]
        public long SubjectID { get; set; }
        public Subject Subject { get; set; }
        
        [ForeignKey("AcademicYear")]
        public long AcademicYearID { get; set; }
        public AcademicYear AcademicYear { get; set; } 
    }
} 