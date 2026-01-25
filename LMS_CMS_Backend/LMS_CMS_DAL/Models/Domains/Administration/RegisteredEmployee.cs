using LMS_CMS_DAL.Models.Domains.RegisterationModule;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.Administration
{
    public class RegisteredEmployee
    {
        [Key]
        public long ID { get; set; }
        public DateTime ApplicationDate { get; set; } = DateTime.Now;
        //public string PositionAppliedFor { get; set; }  // Title
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string en_name { get; set; }

        [StringLength(100, ErrorMessage = "لا يمكن أن يكون الاسم أطول من 100 حرف")]
        public string ar_name { get; set; }

        public long? Nationality { get; set; }
        public string? Gender { get; set; }
        public string? BirthdayDate { get; set; }
        public string? PassportNumber { get; set; }
        public string? MaritalStatus { get; set; }

        public string? PassportAddress { get; set; }

        public string? CurrentAddress { get; set; }

        public string Mobile { get; set; }
        [EmailAddress]
        public string Email { get; set; }
        public string University { get; set; }

        public DateTime GraduationYear { get; set; }

        public string faculty { get; set; }
        public string Major { get; set; }

        public string SchoolYouGraduatedFrom { get; set; }
        public string OtherStudies { get; set; }

        public string ComputerSkills { get; set; }
        public string? Hobbies { get; set; }
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
        public string? Comment { get; set; }

        public bool IsHRScreened { get; set; } = false;

        public bool? IsAccepted { get; set; }

        [Required]
        [ForeignKey("Department")]
        public long? DepartmentID { get; set; }
        public Department Department { get; set; }

        public long? TitleID { get; set; }

        [ForeignKey("TitleID")]
        public Title? Title { get; set; }


        public long? InterviewStateID { get; set; }
  
        [ForeignKey("InterviewStateID")]
        public InterviewState? InterviewState { get; set; }

        public string? ProfileImageUrl { get; set; }
        public ICollection<EmployeeAttachment> Attachments { get; set; } = new HashSet<EmployeeAttachment>();

    }
}
