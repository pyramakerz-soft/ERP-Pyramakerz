using LMS_CMS_DAL.Models.Domains.Administration;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains.LMS
{
    public class DiscussionRoomStudentClassroom : AuditableEntity
    {
        [Key]
        public long ID { get; set; }

        [ForeignKey("Discussion")]
        public long DiscussionRoomID { get; set; }
        public DiscussionRoom DiscussionRoom { get; set; }

        [ForeignKey("StudentClassroom")]
        public long StudentClassroomID { get; set; }
        public StudentClassroom StudentClassroom { get; set; }
    }
}
