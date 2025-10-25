using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class AppointmentAddDTO
    {
        public string Title { get; set; }
        public DateOnly Date { get; set; }
        public DateOnly DueDateToParentToAccept { get; set; }
        public long SchoolID { get; set; }
        public List<long> GradeIds { get; set; }
    }
}
