using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class CandidateSubmit_GetDTO
    {
        public long ID { get; set; }

        public string En_Name { get; set; }         

        public string? Ar_Name { get; set; }       

        public string Email { get; set; }

        public string? Phone { get; set; }

        public DateTime ApplicationDate { get; set; }   // Time logged

        public string PositionAppliedFor { get; set; }  // Title 

        public string Status { get; set; } = "Pending"; // Pending, Accepted, Refused

        public bool IsHRScreened { get; set; } = false;
        public long DepartmentID { get; set; }
        public string DepartmentName { get; set; }

        //public long? EmployeeID { get; set; }
        //public string? EmployeeFullName { get; set; }

    }
}
