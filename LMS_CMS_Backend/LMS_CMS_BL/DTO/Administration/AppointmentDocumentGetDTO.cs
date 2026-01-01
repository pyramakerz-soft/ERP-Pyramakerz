using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Administration
{
    public class AppointmentDocumentGetDTO
    {
        public int Id { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string DocumentName { get; set; }
        public long? InsertedByUserId { get; set; }

        //public string? DocumentStatus { get; set; }
        //public DateTime? SubmissionDate { get; set; }
        //public string? Notes { get; set; }
    }
    public class AppointmentDocumentAddDTO
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string DocumentName { get; set; }
        public DateTime AppointmentDate { get; set; }

        //public string? DocumentStatus { get; set; }
        //public DateTime? SubmissionDate { get; set; }
        //public string? Notes { get; set; }
    }
    public class AppointmentDocumentEditeDTO 
    {
        public int Id { get; set; }
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string DocumentName { get; set; }
    }

}
