using LMS_CMS_DAL.Models.Domains.SocialWorker;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class ConductTypeSectionGetDTO
    {
        public long ID { get; set; }
        public long ConductTypeID { get; set; }
        public string ConductTypeName { get; set; }
        public long SectionID { get; set; }
        public string SectionName { get; set; }
    }
}
