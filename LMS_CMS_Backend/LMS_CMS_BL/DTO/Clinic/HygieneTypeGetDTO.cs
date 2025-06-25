using System.ComponentModel.DataAnnotations;

namespace LMS_CMS_BL.DTO.Clinic
{
    public class HygieneTypeGetDTO
    {
        public long ID { get; set; }
        public string? Type { get; set; }
        public long? InsertedByUserId { get; set; }
        public string? en_name { get; set; }
    }
}
