using LMS_CMS_DAL.Models.Domains.SocialWorker;
using LMS_CMS_DAL.Models.Domains;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class AppointmentParentGetDTO
    {
        public long ID { get; set; }
        public long AppointmentID { get; set; }
        public string AppointmentTitle { get; set; }
        public long ParentID { get; set; }
        public string ParentEnName { get; set; }
        public string ParentArName { get; set; }
        public long AppointmentStatusID { get; set; }
        public string AppointmentStatusName { get; set; }
    }
}
