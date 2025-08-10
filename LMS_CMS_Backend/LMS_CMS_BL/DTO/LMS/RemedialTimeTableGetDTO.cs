using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class RemedialTimeTableGetDTO
    {
        public long ID { get; set; }
        public string Name { get; set; }
        public bool IsFavourite { get; set; }
        public long AcademicYearID { get; set; }
        public string AcademicYearName { get; set; }
        public long SchoolID { get; set; }
        public string SchoolName { get; set; }
        public int? MaximumPeriodCountRemedials { get; set; }
        public DateTime? InsertedAt { get; set; }
        public ICollection<GroupRemedialTimeTableDay> GroupDays { get; set; } 

    }
}
