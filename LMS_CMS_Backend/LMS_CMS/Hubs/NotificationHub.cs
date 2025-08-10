using LMS_CMS_BL.DTO.Communication;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace LMS_CMS_PL.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string> _connectionGroups = new();

        public override async Task OnConnectedAsync()
        {
            // Clean up any existing group for this connection
            if (_connectionGroups.TryRemove(Context.ConnectionId, out var oldGroup))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, oldGroup); 
            }

            await base.OnConnectedAsync(); 
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Clean up when client disconnects
            if (_connectionGroups.TryRemove(Context.ConnectionId, out var oldGroup))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, oldGroup); 
            }

            await base.OnDisconnectedAsync(exception); 
        }

        public async Task JoinGroup(string groupName)
        {
            // Remove from previous group if any
            if (_connectionGroups.TryGetValue(Context.ConnectionId, out var currentGroup))
            {
                if (currentGroup != groupName)
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, currentGroup); 
                }
            }

            // Add to new group
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            _connectionGroups[Context.ConnectionId] = groupName; 
        }
    }
}
