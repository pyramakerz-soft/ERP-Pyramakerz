using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class BounsCategoryGetDTO
    {
        public long ID { get; set; }
        public string EnNameCategory { get; set; }
        public string ArNameCategory { get; set; }
        public long? InsertedByUserId { get; set; }
    }

    public class BounsCategoryAddDTO
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string EnNameCategory { get; set; }
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string ArNameCategory { get; set; }

    }
    public class BounsCategoryEditeDTO
    {
        public long Id { get; set; }
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string EnNameCategory { get; set; }
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string ArNameCategory { get; set; }
    }

}
