using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Communication
{
    public class UserFilter
    {
        // For Employee
        public long? DepartmentID { get; set; } 
        public long? EmployeeID { get; set; } 
        
        // For Student
        public long? SchoolID { get; set; } 
        public long? SectionID { get; set; } 
        public long? GradeID { get; set; } 
        public long? ClassroomID { get; set; } 
        public long? StudentID { get; set; } 

        // For Parent
        public long? ParentID { get; set; } 
    }
}
