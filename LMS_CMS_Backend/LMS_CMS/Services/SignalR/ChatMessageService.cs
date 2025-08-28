using LMS_CMS_PL.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace LMS_CMS_PL.Services.SignalR
{
    public class ChatMessageService
    {
        private readonly IHubContext<ChatMessageHub> _hubContext;

        public ChatMessageService(IHubContext<ChatMessageHub> hubContext)
        {
            _hubContext = hubContext;
        }
        public async Task PushRealTimeMessage(long userId, long userType, string domainName)
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

            var uniqueKey = $"{domainName}_chat_{userTypeString}_{userId}";

            // Ensure the client is in the group
            await _hubContext.Groups.AddToGroupAsync(uniqueKey, uniqueKey);

            // Send message
            await _hubContext.Clients.Group(uniqueKey).SendAsync("ReceiveMessage");
        }
    }
}
