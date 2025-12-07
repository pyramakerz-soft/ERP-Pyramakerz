using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{       
    public class StudentGetForCreateDTO
    { 
        public string User_Name { get; set; }
        public string en_name { get; set; }
        public string ar_name { get; set; } 
        public string Password { get; set; }   
        public string? NationalID { get; set; }
        public long? Nationality { get; set; }  
        public long GenderId { get; set; }  
        public long? Parent_Id { get; set; }
        public string DateOfBirth { get; set; } 
        public string PassportNo { get; set; } 
        public string Religion { get; set; }
        public string MotherName { get; set; }
        public string MotherPassportNo { get; set; } 
        public string MotherNationalID { get; set; } 
        public string MotherQualification { get; set; }
        public string MotherWorkPlace { get; set; }
        public string PreviousSchool { get; set; }
        public long? RegistrationFormParentID { get; set; }
        public long? StartAcademicYearID { get; set; }   
        public string? MotherMobile { get; set; }
        public string? MotherEmail { get; set; } 
        public long? InsertedByUserId { get; set; }
        public DateTime? InsertedAt { get; set; } 
    }
}
