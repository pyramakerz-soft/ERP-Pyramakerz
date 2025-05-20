namespace LMS_CMS_PL.Services
{
    public class DomainService
    {
        public string GetFullHost(HttpContext context)
        {
            return context?.Request?.Host.Value ?? string.Empty;
        }

        public string GetDomain(HttpContext context)
        {
            var host = GetFullHost(context);
            if (string.IsNullOrWhiteSpace(host))
                return string.Empty;

            var parts = host.Split('.');
            if (parts.Length < 2)
                return host;

            return string.Join(".", parts[^2], parts[^1]);
        }

        public string GetSubdomain(HttpContext context)
        {
            var host = GetFullHost(context);
            if (string.IsNullOrWhiteSpace(host))
                return string.Empty;

            var parts = host.Split('.');
            if (parts.Length <= 2)
                return string.Empty;

            return string.Join(".", parts.Take(parts.Length - 2));
        }
    }
}
