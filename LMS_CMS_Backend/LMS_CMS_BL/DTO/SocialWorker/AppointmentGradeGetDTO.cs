using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class AppointmentGradeGetDTO
    {
        public long ID { get; set; }
        public long AppointmentID { get; set; }
        public string AppointmentTitle { get; set; }
        public long GradeID { get; set; }
        public string GradeName { get; set; }

    }
}
