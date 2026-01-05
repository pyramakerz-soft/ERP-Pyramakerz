using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Administration
{
    public class RegisteredEmployeeGetDTO
    {
        public long ID { get; set; } 
        public string en_name { get; set; } // CandidateName
        public string ar_name { get; set; } 
        public string Email { get; set; }
        public string Phone { get; set; }
        public string DepartmentName { get; set; }
        public string PositionAppliedFor { get; set; }  // title
        public DateTime ApplicationDate { get; set; } = DateTime.Now;
        public string InterviewStatus { get; set; }
        public bool IsHRScreened { get; set; }  
    }
}
