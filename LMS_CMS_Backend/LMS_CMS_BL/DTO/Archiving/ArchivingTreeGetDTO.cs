using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_DAL.Models.Domains.Archiving;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Archiving
{
    public class ArchivingTreeGetDTO
    {
        public long ID { get; set; } 
        public string Name { get; set; }
        public string? FileLink { get; set; } 
        public long? ArchivingTreeParentID { get; set; } 
        public long InsertedByUserId { get; set; }

        public List<ArchivingTreeGetDTO> Children { get; set; } = new List<ArchivingTreeGetDTO>();
    }
}
