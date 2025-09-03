using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.Archiving
{
    public class PermissionGroupEmployee : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        [ForeignKey("PermissionGroup")] 
        public long PermissionGroupID { get; set; }
        public PermissionGroup PermissionGroup { get; set; }
        
        [ForeignKey("Employee")] 
        public long EmployeeID { get; set; }
        public Employee Employee { get; set; }
    }
}
