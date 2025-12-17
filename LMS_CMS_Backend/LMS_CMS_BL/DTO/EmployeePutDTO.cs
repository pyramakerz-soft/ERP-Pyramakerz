using LMS_CMS_DAL.Models.Domains.BusModule;
using LMS_CMS_DAL.Models.Domains;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO
{
    public class EmployeePutDTO
    {
        [Key]
        public long ID { get; set; }
        [Required(ErrorMessage = "User_Name is required")]
        [StringLength(100, ErrorMessage = "Username cannot be longer than 100 characters.")]
        public string User_Name { get; set; }

        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string en_name { get; set; }

        [StringLength(100, ErrorMessage = "لا يمكن أن يكون الاسم أطول من 100 حرف")]
        public string? ar_name { get; set; } 
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
        public string PreviousExperiencePlace { get; set; }
        public string Position { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public string HowDidYouFindUs { get; set; }
        public string ReasonforLeavingtheJob { get; set; }
        public string DidYouHaveAnyRelativeHere { get; set; }
        public string YourLevelInEnglish { get; set; }
        public string YourLevelInFrensh { get; set; }
        public string DoYouSpeakAnyOtherLanguages { get; set; }
        public string CurrentJob { get; set; }
        public decimal LastSalary { get; set; }
        public bool AuthorizeInvestigation { get; set; }

        public string FullName { get; set; }
        public DateTime EnterDate { get; set; }
        public string Signature { get; set; }
        public string? LicenseNumber { get; set; }
        public string? ExpireDate { get; set; }
        public string? Address { get; set; }
        public bool? CanReceiveRequest { get; set; } 
        public bool? CanReceiveRequestFromParent { get; set; }
        public bool? CanReceiveMessageFromParent { get; set; }
        public bool IsRestrictedForLoctaion { get; set; }

        [Required]
        public long Role_ID { get; set; }
        [Required]
        public long? BusCompanyID { get; set; }
        [Required]
        public long EmployeeTypeID { get; set; }

        public List<long>? NewFloorsSelected { get; set; } = new();
        public List<long>? DeletedFloorsSelected { get; set; } = new();

        public List<long>? NewLocationSelected { get; set; } = new();
        public List<long>? DeletedLocationSelected { get; set; } = new();

        public List<long>? NewGradesSelected { get; set; } = new();
        public List<long>? DeletedGradesSelected { get; set; } = new();

        public List<long>? NewSubjectsSelected { get; set; } = new();
        public List<long>? DeletedSubjectsSelected { get; set; } = new();

    }
}
