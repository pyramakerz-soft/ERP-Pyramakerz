using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.Administration
{
    public class Offer : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        public DateTime TimeLogged { get; set; } = DateTime.Now;

        [Required(ErrorMessage = "Upload file is required")]
        [StringLength(500)]
        public string UploadedFilePath { get; set; } 

        [Required]
        public long DepartmentID { get; set; }

        [ForeignKey("DepartmentID")]
        public  Department? Department { get; set; }

        [Required]
        public long TitleID { get; set; }

        [ForeignKey("TitleID")]
        public  Title? Title { get; set; }

    }
}
