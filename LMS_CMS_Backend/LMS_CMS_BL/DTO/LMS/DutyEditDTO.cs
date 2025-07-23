using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class DutyEditDTO
    {
        public long ID { get; set; }
        public long TeacherID { get; set; }
        public DateOnly Date { get; set; }
        public long ClassID { get; set; }
        public int Period { get; set; }
    }
}
