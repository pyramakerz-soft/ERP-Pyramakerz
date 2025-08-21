using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_PL.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace LMS_CMS_PL.Services.SignalR
{
    public class RequestService
    {
        private readonly IHubContext<RequestHub> _hubContext;

        public RequestService(IHubContext<RequestHub> hubContext)
        {
            _hubContext = hubContext;
        } 

        public async Task NotifyNewRequest(long receiverId, long receiverTypeId, string domainName)
        {
            string userTypeString = receiverTypeId switch
            {
                1 => "employee",
                2 => "student",
                3 => "parent",
                _ => null
            };

            if (string.IsNullOrEmpty(domainName) || userTypeString == null)
                throw new Exception("Invalid domain or user type.");

            var groupName = $"{domainName}_request_{userTypeString}_{receiverId}";

            // Ensure the client is in the group
            await _hubContext.Groups.AddToGroupAsync(groupName, groupName);

            await _hubContext.Clients.Group(groupName).SendAsync("NewRequest");
        }
    }
} 