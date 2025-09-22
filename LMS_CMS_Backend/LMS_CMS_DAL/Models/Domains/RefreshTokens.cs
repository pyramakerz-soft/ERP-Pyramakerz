using LMS_CMS_DAL.Models.Domains.BusModule;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_DAL.Models.Domains
{
    public class RefreshTokens
    {
        public long ID { get; set; }
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool IsRevoked { get; set; }

        // Foreign key to link refresh token with a user
        public long UserID { get; set; } 

        [ForeignKey("UserType")]
        public long UserTypeID { get; set; }
        public UserType UserType { get; set; }
    }
}
