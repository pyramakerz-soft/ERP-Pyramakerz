using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.LMS
{
    public class SchoolEditEtaDTO
    {
        public long ID { get; set; }
        public string? ClientID { get; set; }
        public string? SecretNumber1 { get; set; }
        public string? SecretNumber2 { get; set; }
    }
}
