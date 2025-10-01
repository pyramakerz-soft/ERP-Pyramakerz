using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Octa
{
    public class DomainSetupResultDTO
    {
        public string AdminUserName { get; set; } = "Admin";
        public string AdminPasswordPlain { get; set; } = null!;
        public string? DomainLink { get; set; }
        public List<long>? NotFoundPages { get; set; }
        public List<long>? NotModulePages { get; set; }
    }
}
