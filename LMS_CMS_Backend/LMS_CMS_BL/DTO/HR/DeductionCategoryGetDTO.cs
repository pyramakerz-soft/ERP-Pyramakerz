using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.HR
{
    public class DeductionCategoryGetDTO
    {
        public long ID { get; set; }
        public string EnNameDeductionCategory { get; set; }
        public string ArNameDeductionCategory { get; set; }
        public long? InsertedByUserId { get; set; }

    }
    public class DeductionCategoryAddDTO
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string EnNameDeductionCategory { get; set; }
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string ArNameDeductionCategory { get; set; }

    }
    public class DeductionCategoryEditeDTO
    {
        public long Id { get; set; }
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string EnNameDeductionCategory { get; set; }
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string ArNameDeductionCategory { get; set; }
    }

}
