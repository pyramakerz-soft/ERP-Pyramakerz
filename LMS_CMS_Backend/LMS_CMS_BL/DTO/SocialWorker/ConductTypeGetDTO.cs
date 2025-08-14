using LMS_CMS_DAL.Models.Domains.SocialWorker;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class ConductTypeGetDTO
    {
        public long ID { get; set; }
        public string en_name { get; set; } 
        public string ar_name { get; set; }
        public long ConductLevelID { get; set; }
        public string ConductLevelName { get; set; }
        public long SchoolID { get; set; }
        public string SchoolName { get; set; }
        public List<ConductTypeSectionGetDTO> ConductTypeSections { get; set; }
        public DateTime? InsertedAt { get; set; }
        public long? InsertedByUserId { get; set; }

    }
}
