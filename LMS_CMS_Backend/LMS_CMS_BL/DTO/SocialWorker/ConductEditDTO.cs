using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class ConductEditDTO
    {
        public long ID { get; set; }
        public string? Details { get; set; }
        public DateOnly Date { get; set; }
        public bool IsSendSMSToParent { get; set; }
        public string? File { get; set; }
        public string? DeletedFile { get; set; }
        public IFormFile? NewFile { get; set; }
        public long StudentID { get; set; }
        public long ConductTypeID { get; set; }
        public long ProcedureTypeID { get; set; }
        public long ClassroomID { get; set; }
    }
}
