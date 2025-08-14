using LMS_CMS_DAL.Models.Domains.LMS;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class CertificateTypeStudentAddDTO
    {
        public long StudentID { get; set; }
        public long CertificateTypeID { get; set; }
    }
}
