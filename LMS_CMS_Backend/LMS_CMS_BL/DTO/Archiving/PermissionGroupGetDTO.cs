using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Archiving
{
    public class PermissionGroupGetDTO
    {
        public long ID { get; set; } 
        public string En_Name { get; set; } 
        public string Ar_Name { get; set; }
        public long InsertedByUserId { get; set; }
    }
}
