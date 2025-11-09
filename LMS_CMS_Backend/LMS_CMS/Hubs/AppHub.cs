using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace LMS_CMS_PL.Hubs
{
    [Authorize]
    public class AppHub: Hub
    { 
        private static readonly ConcurrentDictionary<string, HashSet<string>> _connectionGroups = new();

        public override async Task OnConnectedAsync()
        {
            if (!_connectionGroups.ContainsKey(Context.ConnectionId))
            {
                _connectionGroups.TryAdd(Context.ConnectionId, new HashSet<string>());
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (_connectionGroups.TryRemove(Context.ConnectionId, out var groups))
            {
                foreach (var group in groups)
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, group);
                }
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinGroup(string groupName)
        {
            _connectionGroups.TryAdd(Context.ConnectionId, new HashSet<string>());

            if (!_connectionGroups[Context.ConnectionId].Contains(groupName))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
                _connectionGroups[Context.ConnectionId].Add(groupName);
            }
        }
    }
}
