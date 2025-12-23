using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.Administration
{
    public class Title : AuditableEntity
    {
      [Key]
        public long ID { get; set; }

        [Required(ErrorMessage = "Title Name is required")]
        [StringLength(100, ErrorMessage = "Title Name cannot be longer than 100 characters.")]
        public string Name { get; set; }

        public DateTime Date { get; set; } 
      
        public long DepartmentID { get; set; }

        [ForeignKey("DepartmentID")]
        public Department Department { get; set; }
        public ICollection<Offer> Offers { get; set; } = new List<Offer>();
    }  
}
