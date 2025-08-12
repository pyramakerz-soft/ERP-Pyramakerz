using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class ConductAddDTO
    {
        public string? Details { get; set; }
        public DateOnly Date { get; set; }
        public bool IsSendSMSToParent { get; set; }
        public IFormFile? NewFile { get; set; }
        public long StudentID { get; set; }
        public long ConductTypeID { get; set; }
        public long ProcedureTypeID { get; set; }
    }
}
