
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace LMS_CMS_PL.Services
{
    public class CachedJwtValidator
    {
        private readonly IMemoryCache _cache;
        private readonly IConfiguration _config;

        public CachedJwtValidator(IMemoryCache cache, IConfiguration config)
        {
            _cache = cache;
            _config = config;
        }

        public bool ValidateToken(string token)
        {
            if (string.IsNullOrEmpty(token)) return false;

            // Try to get cached result
            if (_cache.TryGetValue(token, out bool isValid))
            {
                return isValid;
            }

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_config["JWT:Key"]);

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidIssuer = _config["JWT:Issuer"],
                    ValidAudience = _config["JWT:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                }, out _);

                isValid = true;
            }
            catch
            {
                isValid = false;
            }

            // Cache result for 1 minute (adjust as needed)
            _cache.Set(token, isValid, TimeSpan.FromMinutes(1));

            return isValid;
        }
    }
}
