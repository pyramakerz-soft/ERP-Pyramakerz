using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.DTO.Communication
{
    public class NotificationAddDTO
    {
        public IFormFile? ImageFile { get; set; }
        public string? Text { get; set; }
        public string? Link { get; set; }
        public long UserTypeID { get; set; }
        public bool IsAllowDismiss { get; set; }
        public UserFilter? UserFilters { get; set; }
    }
}
