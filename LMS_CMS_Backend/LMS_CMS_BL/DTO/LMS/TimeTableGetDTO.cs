using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class TimeTableGetDTO
    {
        public long ID { get; set; }
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string Name { get; set; }
        public bool IsFavourite { get; set; }
        public long AcademicYearID { get; set; }
        public string AcademicYearName { get; set; }
        public long? InsertedByUserId { get; set; }
        public DateTime? InsertedAt { get; set; }
        public ICollection<TimeTableClassroomGetDTO> TimeTableClassrooms { get; set; }


    }
}
