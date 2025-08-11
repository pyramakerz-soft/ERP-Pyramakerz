namespace LMS_CMS_BL.DTO.Clinic
{
    public class MedicalHistoryGetByParentDTO
    {
        public long ID { get; set; }
        public long SchoolId { get; set; }
        public string School { get; set; }
        public long GradeId { get; set; }
        public string Grade { get; set; }
        public long ClassRoomID { get; set; }
        public string ClassRoom { get; set; }
        public long StudentId { get; set; }
        public string Student { get; set; }
        public string? Details { get; set; }
        public string? PermanentDrug { get; set; }
        public string? FirstReport { get; set; }
        public string? SecReport { get; set; }
        public DateTime? InsertedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public long? InsertedByParentID { get; set; }
        public string? en_name { get; set; }
    }
}
