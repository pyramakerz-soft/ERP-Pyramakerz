using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO
{
    public class EmployeeAddDTO
    {
        [Required(ErrorMessage = "User_Name is required")]
        [StringLength(100, ErrorMessage = "Username cannot be longer than 100 characters.")]
        public string User_Name { get; set; }

        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string en_name { get; set; }

        [StringLength(100, ErrorMessage = "لا يمكن أن يكون الاسم أطول من 100 حرف")]
        public string? ar_name { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters.")]
        public string Password { get; set; }
        public string? Mobile { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public DateTime GraduationYear { get; set; }
        public string? MaritalStatus { get; set; }
        public string? Gender { get; set; }
        public string University { get; set; }
        public string faculty { get; set; }
        public string Major { get; set; }
        public string SchoolYouGraduatedFrom { get; set; }
        public string OtherStudies { get; set; }
        public string ComputerSkills { get; set; }
        public string Hobbies { get; set; }
        public DateTime ApplicationDate { get; set; }
        public string PositionAppliedFor { get; set; }

        public string? LicenseNumber { get; set; }
        public string? ExpireDate { get; set; }
        public string? Address { get; set; }
        public long Role_ID { get; set; }
        public long? BusCompanyID { get; set; }
        public long EmployeeTypeID { get; set; }
        public bool? CanReceiveRequest { get; set; } 
        public bool? CanReceiveRequestFromParent { get; set; }
        public bool? CanReceiveMessageFromParent { get; set; }
        public bool IsRestrictedForLoctaion { get; set; }
        public List<long>? FloorsSelected { get; set; } = new();
        public List<long>? GradeSelected { get; set; } = new();
        public List<long>? SubjectSelected { get; set; } = new();
    }
}
