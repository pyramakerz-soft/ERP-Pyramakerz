using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Administration
{
    public class SocialInsuranceGetDTO
    {
        public int Id { get; set; }
        public string InsuranceOfficeName { get; set; }
        public DateTime CreatedDate { get; set; }
        public long? InsertedByUserId { get; set; }
        //public string? InsuranceNumber { get; set; }
        //public DateTime? StartDate { get; set; }
        //public DateTime? LastWorkingDate { get; set; }
        //public decimal? InsuranceSalary { get; set; }
        //public string? CondidateNane { get; set; }

    }
    public class SocialInsuranceAddDTO
    {

        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string InsuranceOfficeName { get; set; }
        public DateTime CreatedDate { get; set; }
        //public string? InsuranceNumber { get; set; }
        //public DateTime? StartDate { get; set; }
        //public DateTime? LastWorkingDate { get; set; }
        //public decimal? InsuranceSalary { get; set; }
        //public string? CondidateNane { get; set; }
    }
    public class SocialInsuranceEditDTO
    {
        public int Id { get; set; }
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string InsuranceOfficeName { get; set; }
    }

}
