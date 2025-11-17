using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class DirectMarkClassesGetDTO
    {
        [Key]
        public long ID { get; set; }
        public long DirectMarkID { get; set; }
        public string DirectMarkEnglishName { get; set; }
        public string DirectMarkArabicName { get; set; }
        public long ClassroomID { get; set; }
        public string ClassroomName { get; set; }

    }
}
