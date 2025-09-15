using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;

namespace LMS_CMS_PL.Middleware
{
    public class SuspendMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public SuspendMiddleware(RequestDelegate next, IServiceScopeFactory serviceScopeFactory)
        {
            _next = next;
            _serviceScopeFactory = serviceScopeFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            Console.WriteLine("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");

            var endpoint = context.GetEndpoint();
            var attribute = endpoint?.Metadata.GetMetadata<CheckSuspensionAttribute>();
             
            if (attribute == null)
            {
                await _next(context);
                return;
            }

            var userIdClaim = context.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userType = context.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userType))
            {
                await _next(context); // no user → skip
                return;
            }

            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var dbContextFactory = scope.ServiceProvider.GetRequiredService<DbContextFactoryService>();
                var unitOfWork = dbContextFactory.CreateOneDbContext(context);

                long.TryParse(userIdClaim, out var userId);

                object? user = null;
                if (userType == "employee")
                    user = unitOfWork.employee_Repository.Select_By_Id(userId);
                else if (userType == "student")
                    user = unitOfWork.student_Repository.Select_By_Id(userId);

                if (user != null)
                {
                    dynamic dynamicUser = user;
                    if (dynamicUser.IsSuspended == true)
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        await context.Response.WriteAsync("User is suspended.");
                        return;
                    }
                }
            }

            await _next(context);
        }
    }
}
