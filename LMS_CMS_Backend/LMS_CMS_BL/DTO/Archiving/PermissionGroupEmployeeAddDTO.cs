using LMS_CMS_DAL.Models.Domains.Archiving;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Archiving
{
    public class PermissionGroupEmployeeAddDTO
    {
        public long PermissionGroupID { get; set; } 
        public long EmployeeID { get; set; }
    }
}
