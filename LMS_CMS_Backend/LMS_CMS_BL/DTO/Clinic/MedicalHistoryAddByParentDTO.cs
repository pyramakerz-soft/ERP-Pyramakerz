using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace LMS_CMS_BL.DTO.Clinic
{
    public class MedicalHistoryAddByParentDTO
    {
        [Required(ErrorMessage = "Student ID is required")]
        public long StudentId { get; set; }
        public string Details { get; set; }
        public string PermanentDrug { get; set; }
        public IFormFile? FirstReport { get; set; }
        public IFormFile? SecReport { get; set; }
    }
}
