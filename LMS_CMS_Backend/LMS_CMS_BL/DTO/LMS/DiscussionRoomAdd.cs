using LMS_CMS_DAL.Models.Domains.LMS;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class DiscussionRoomAdd
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(100, ErrorMessage = "Title cannot be longer than 100 characters.")]
        public string Title { get; set; }
        public string MeetingLink { get; set; }
        public string? RecordLink { get; set; }
        public IFormFile? ImageFile { get; set; }
        public bool IsRepeatedWeekly { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string Time { get; set; }

        public List<long> StudentClassrooms { get; set; } 
    }
}
