using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.SocialWorker
{
    public class ConductReportDTO
    {
        public long ID { get; set; }
        public DateOnly Date { get; set; }
        public long StudentID { get; set; }
        public string StudentEnName { get; set; } 
        public string StudentArName { get; set; } 
        public ConductTypeReportDTO ConductType { get; set; }
        public ProcedureTypeReportDTO ProcedureType { get; set; }
        public string? Details { get; set; }
    }
}
