using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Administration
{
    public class RegisteredEmployeeAddDTO
    {

        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string en_name { get; set; }

        [StringLength(100, ErrorMessage = "لا يمكن أن يكون الاسم أطول من 100 حرف")]
        public string ar_name { get; set; }

        [EmailAddress]
        public string Email { get; set; }

        [Required(ErrorMessage = "Mobile number is required")]
        public string Mobile { get; set; }

        //public long? DepartmentID { get; set; } 
        [Required(ErrorMessage = "Job title required")]
        public long? TitleID { get; set; }

        public string? Gender { get; set; }

        public string? BirthdayDate { get; set; }  

        public string? PassportNumber { get; set; }

        public string? MaritalStatus { get; set; }

        public string? PassportAddress { get; set; }

        public string? CurrentAddress { get; set; }

        public string University { get; set; }
        public DateTime? GraduationYear { get; set; }  //

        public string faculty { get; set; }

        public string Major { get; set; }

        public string SchoolYouGraduatedFrom { get; set; }

        public string OtherStudies { get; set; }

        public string ComputerSkills { get; set; }

        public string? Hobbies { get; set; }

        public string PreviousExperiencePlace { get; set; }

        public string Position { get; set; }
        public DateTime? FromDate { get; set; }  //

        public DateTime? ToDate { get; set; }      //

        public string HowDidYouFindUs { get; set; }

        public string ReasonforLeavingtheJob { get; set; }

        public string DidYouHaveAnyRelativeHere { get; set; }

        public string YourLevelInEnglish { get; set; }

        public string YourLevelInFrensh { get; set; }

        public string DoYouSpeakAnyOtherLanguages { get; set; }

        public string CurrentJob { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "The salary must be a positive number.")]
        public decimal LastSalary { get; set; }

        public bool AuthorizeInvestigation { get; set; }

        public string FullName { get; set; }
        public DateTime EnterDate { get; set; }
        public string? Comment { get; set; }

        public long? Nationality { get; set; }
        public IFormFile? ProfileImage { get; set; }

    }
}
