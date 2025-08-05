using LMS_CMS_BL.DTO.Communication;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace LMS_CMS_PL.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(DbContextFactoryService dbContextFactory, ILogger<NotificationHub> logger)
        {
            _dbContextFactory = dbContextFactory;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var domainName = httpContext?.Request.Headers["Domain-Name"].FirstOrDefault();
            var userId = Context.User?.FindFirst("id")?.Value;
            var userType = Context.User?.FindFirst("type")?.Value;

            if (string.IsNullOrEmpty(domainName) || string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userType))
            {
                _logger.LogError("Missing domain name, user ID, or user type during connection. Domain: {Domain}, UserId: {UserId}, UserType: {UserType}", domainName, userId, userType);
                throw new HubException("Missing domain name, user ID, or user type.");
            }

            // Get the connection string from the context
            var connectionString = httpContext?.Items["ConnectionString"]?.ToString();
            if (string.IsNullOrEmpty(connectionString))
            {
                _logger.LogError("Connection string missing for domain: {Domain}", domainName);
                throw new HubException("Connection string is missing.");
            }

            var groupName = $"{domainName}_{userType}_{userId}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            _logger.LogInformation("User connected: {GroupName}, ConnectionId: {ConnectionId}", groupName, Context.ConnectionId);

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var httpContext = Context.GetHttpContext();
            var domainName = httpContext?.Request.Headers["Domain-Name"].FirstOrDefault();
            var userId = Context.User?.FindFirst("id")?.Value;
            var userType = Context.User?.FindFirst("type")?.Value;

            if (!string.IsNullOrEmpty(domainName) && !string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(userType))
            {
                var groupName = $"{domainName}_{userType}_{userId}";
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
                _logger.LogInformation("User disconnected: {GroupName}, ConnectionId: {ConnectionId}", groupName, Context.ConnectionId);
            }

            if (exception != null)
            {
                _logger.LogError(exception, "Error during disconnection for ConnectionId: {ConnectionId}", Context.ConnectionId);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
