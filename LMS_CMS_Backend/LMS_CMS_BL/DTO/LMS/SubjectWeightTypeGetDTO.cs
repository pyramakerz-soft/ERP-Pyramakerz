using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class SubjectWeightTypeGetDTO
    {
        public long ID { get; set; }
        public long WeightTypeID { get; set; }
        public long SubjectID { get; set; }
        public float Value { get; set; }
        public string WeightTypeEnglishName { get; set; } 
        public string WeightTypeArabicName { get; set; }
        public string SubjectEnglishName { get; set; } 
        public string SubjectArabicName { get; set; }
        public long? InsertedByUserId { get; set; }
    }
}
