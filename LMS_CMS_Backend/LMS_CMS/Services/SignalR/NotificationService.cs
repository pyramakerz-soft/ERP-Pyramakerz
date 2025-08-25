using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_PL.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace LMS_CMS_PL.Services.SignalR
{
    public class NotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext; 

        public NotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext; 
        } 
        public async Task PushRealTimeNotification(long userId, long userType, object notification, string domainName)
        {
            string userTypeString = userType switch
            {
                1 => "employee",
                2 => "student",
                3 => "parent",
                _ => null
            };

            if (string.IsNullOrEmpty(domainName) || userTypeString == null)
                throw new Exception("Invalid domain or user type.");

            var uniqueKey = $"{domainName}_{userTypeString}_{userId}";

            // Ensure the client is in the group
            await _hubContext.Groups.AddToGroupAsync(uniqueKey, uniqueKey);

            // Send notification
            await _hubContext.Clients.Group(uniqueKey).SendAsync("ReceiveNotification", notification);
        }
    }
}
