using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class AppointmentGetDTO 
    {
        public long ID { get; set; }
        public string Title { get; set; }
        public DateOnly Date { get; set; }
        public DateOnly DueDateToParentToAccept { get; set; }
        public long SchoolID { get; set; }
        public string SchoolName { get; set; }
        public List<AppointmentGradeGetDTO> AppointmentGrades { get; set; }
        public List<AppointmentParentGetDTO> AppointmentParents { get; set; }
    }
}
