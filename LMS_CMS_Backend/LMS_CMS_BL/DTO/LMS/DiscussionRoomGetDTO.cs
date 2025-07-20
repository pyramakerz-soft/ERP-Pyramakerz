using LMS_CMS_BL.DTO.Administration;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class DiscussionRoomGetDTO
    {
        public long ID { get; set; } 
        public string Title { get; set; }
        public string MeetingLink { get; set; }
        public string? RecordLink { get; set; }
        public string? ImageLink { get; set; }
        public bool IsRepeatedWeekly { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string Time { get; set; }
        public long? InsertedByUserId { get; set; }
        public List<DiscussionRoomStudentClassroomGetDTO> DiscussionRoomStudentClassrooms { get; set; } = new List<DiscussionRoomStudentClassroomGetDTO>();
    }
}
