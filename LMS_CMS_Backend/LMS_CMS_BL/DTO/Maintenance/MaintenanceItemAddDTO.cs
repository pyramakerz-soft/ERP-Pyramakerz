using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Maintenance
{
    public  class MaintenanceItemAddDTO
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(150)]
        public string En_Name { get; set; }

        [Required(ErrorMessage = "الاسم مطلوب")] 
        [StringLength(150)]
        public string Ar_Name { get; set; }

    }
}
