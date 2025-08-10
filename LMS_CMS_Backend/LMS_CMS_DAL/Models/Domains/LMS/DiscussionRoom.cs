using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class DiscussionRoom : AuditableEntity
    {
        [Key]
        public long ID { get; set; }
        [Required(ErrorMessage = "Title is required")]
        [StringLength(100, ErrorMessage = "Title cannot be longer than 100 characters.")]
        public string Title { get; set; }
        public string MeetingLink { get; set; }
        public string? RecordLink { get; set; }
        public string? ImageLink { get; set; }
        public bool IsRepeatedWeekly { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string Time { get; set; }

        public bool Saturday { get; set; }
        public bool Sunday { get; set; }
        public bool Monday { get; set; }
        public bool Tuesday { get; set; }
        public bool Wednesday { get; set; }
        public bool Thursday { get; set; }
        public bool Friday { get; set; } 

        [ForeignKey("School")]
        public long SchoolID { get; set; }
        public School School { get; set; }
        public ICollection<DiscussionRoomStudentClassroom> DiscussionRoomStudentClassrooms { get; set; } = new List<DiscussionRoomStudentClassroom>();
    }
}
