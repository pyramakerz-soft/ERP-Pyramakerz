using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_DAL.Models.Domains;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Administration
{
    public class AnnouncementSharedToGetDTO
    {
        public long ID { get; set; }
        public long AnnouncementID { get; set; }
        public long UserTypeID { get; set; }
        public string UserTypeTitle { get; set; }
    }
}
