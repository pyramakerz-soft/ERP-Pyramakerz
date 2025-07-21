using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class DiscussionRoomStudentClassroomGetDTO
    {
        public long ID { get; set; } 
        public long DiscussionRoomID { get; set; } 
        public long StudentClassroomID { get; set; }
    }
}
