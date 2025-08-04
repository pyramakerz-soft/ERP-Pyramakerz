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
        public async Task PushRealTimeNotification(long userId, long userType, object notification)
        {
            string userTypeString = userType switch
            {
                1 => "employee",
                2 => "student",
                3 => "parent",
                _ => null
            };

            if (userTypeString == null)
                return; 

            var uniqueKey = $"{userTypeString}_{userId}";
            await _hubContext.Clients.User(uniqueKey).SendAsync("ReceiveNotification", notification);
        }
    }
}
