using LMS_CMS_DAL.Models.Domains.Administration;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.HR
{
    public class CandidateSubmit : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string en_name { get; set; }

        [StringLength(100, ErrorMessage = "لا يمكن أن يكون الاسم أطول من 100 حرف")]
        public string? ar_name { get; set; }      
      
        [EmailAddress]
        public string Email { get; set; }
        public string? Phone { get; set; }
        public DateTime ApplicationDate { get; set; } = DateTime.Now;  // Time logged

        public string PositionAppliedFor { get; set; }   // Title

        public string Status { get; set; } = "Pending"; // Pending, Accepted, Refused
        public bool IsHRScreened { get; set; } = false;
        [Required]
        [ForeignKey("Department")]
        public long DepartmentID { get; set; }
        public Department Department { get; set; }
        // : لو تم قبوله وتحول لموظف
        public long? EmployeeID { get; set; }
        public Employee? Employee { get; set; }
        //public string? CVFilePath { get; set; }
        //public string? PhotoFilePath { get; set; }

    }
}
