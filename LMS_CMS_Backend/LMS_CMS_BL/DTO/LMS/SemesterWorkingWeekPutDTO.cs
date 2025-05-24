using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class SemesterWorkingWeekPutDTO
    {
        public long ID { get; set; }
        [Required(ErrorMessage = "English Name is required")]
        [StringLength(100, ErrorMessage = "English Name cannot be longer than 100 characters.")]
        public string EnglishName { get; set; }
        [Required(ErrorMessage = "Arabic Name is required")]
        [StringLength(100, ErrorMessage = "Arabic Name cannot be longer than 100 characters.")]
        public string ArabicName { get; set; }
        public long SemesterID { get; set; }
        public DateOnly DateFrom { get; set; }
        public DateOnly DateTo { get; set; }
    }
}
