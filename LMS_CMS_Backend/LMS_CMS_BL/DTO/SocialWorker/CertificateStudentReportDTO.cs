using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class CertificateStudentReportDTO
    {
        public long ID { get; set; }
        public long CertificateTypeID { get; set; } 
        public string? CertificateTypeName { get; set; } 
        public DateTime AddedAt { get; set; } 
        public string AddedBy { get; set; } // InsertedByEmployee.en_name or ar_name
    }
}
