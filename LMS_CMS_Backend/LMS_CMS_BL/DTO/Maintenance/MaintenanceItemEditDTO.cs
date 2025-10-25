using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Maintenance
{
    public class MaintenanceItemEditDTO
    {
        public long ID { get; set; }

        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Name is required")]
        [System.ComponentModel.DataAnnotations.StringLength(150)]
        public string E_Name { get; set; }

        //[System.ComponentModel.DataAnnotations.Required(ErrorMessage = "الاسم مطلوب")]
        //[Required(ErrorMessage = "الاسم مطلوب")]

        [System.ComponentModel.DataAnnotations.StringLength(150)]
        public string A_Name { get; set; }

    }
}
