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

        public async Task NotifyRequestUpdate(long userId, long userTypeId, string domainName)
        {
            var groupName = $"{domainName}_request_{userTypeId}_{userId}";
            await _hubContext.Clients.Group(groupName).SendAsync("RequestUpdated");
        }

        public async Task NotifyNewRequest(long receiverId, long receiverTypeId, string domainName)
        {
            var groupName = $"{domainName}_request_{receiverTypeId}_{receiverId}";
            await _hubContext.Clients.Group(groupName).SendAsync("NewRequest");
        }
    }
}
