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
    public class ClassroomSubjectPutDTO
    { 
        public long ID { get; set; } 
        public long? TeacherID { get; set; } 
        public List<long>? CoTeacherIDs { get; set; }
    }
}
