using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class SubjectResourceGetDTO
    {
        public long ID { get; set; } 
        public string EnglishName { get; set; }  
        public string ArabicName { get; set; } 
        public long SubjectID { get; set; }
        public string SubjectEnglishName { get; set; }
        public string SubjectArabicName { get; set; }
        public string FileLink { get; set; }
        public long? InsertedByUserId { get; set; }
    }
}
