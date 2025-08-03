using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS_CMS_BL.Helpers
{
    public class CustomUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
        {
            var userId = connection.User?.FindFirst("id")?.Value;
            var userType = connection.User?.FindFirst("type")?.Value;

            if (userId == null || userType == null)
                return null;

            return $"{userType}_{userId}";
        } 
    }
}
