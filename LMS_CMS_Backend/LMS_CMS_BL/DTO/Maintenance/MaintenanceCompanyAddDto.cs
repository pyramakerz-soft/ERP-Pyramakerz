using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Maintenance
{
    public  class MaintenanceCompanyAddDto
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(150, ErrorMessage = "Name cannot be longer than 150 characters.")]
        public string En_Name { get; set; }

        [Required(ErrorMessage = "الاسم مطلوب")]
        [StringLength(100, ErrorMessage = "لا يمكن أن يكون الاسم أطول من 100 حرف")]
        public string Ar_Name { get; set; }
    }
}
