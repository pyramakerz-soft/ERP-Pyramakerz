using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class CertificateTypeStudentGet
    {
        public long ID { get; set; }
        public long StudentID { get; set; }
        public string StudentEnName { get; set; }
        public string StudentArName { get; set; }
        public long CertificateTypeID { get; set; }
        public string CertificateTypeName { get; set; }
        public string CertificateTypeFile { get; set; }
        public long? InsertedByUserId { get; set; }
        public string InsertedByUserName { get; set; }

    }
}
