using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.Administration
{
    public class AppointmentDocument : AuditableEntity 
    {
        [Key]
        public int Id { get; set; }
        public DateTime AppointmentDate { get; set; } 

        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string DocumentName { get; set; }
        public string? DocumentStatus { get; set; } 
        public DateTime? SubmissionDate { get; set; } 
        public string? Notes { get; set; } 
    }
}
