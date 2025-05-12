using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;

namespace LMS_CMS_PL.Services.Zatca.Invoice
{
    public class SecretsService : ISecretsService
    {
        private readonly IAmazonSecretsManager _secretsManager;

        public SecretsService(IAmazonSecretsManager secretsManager)
        {
            _secretsManager = secretsManager;
        }

        public async Task<string> GetSecretAsync(string secretName)
        {
            var request = new GetSecretValueRequest
            {
                SecretId = secretName
            };

            var response = await _secretsManager.GetSecretValueAsync(request);

            if (response.SecretString != null)
            {
                return response.SecretString;
            }
            else
            {
                return System.Text.Encoding.UTF8.GetString(response.SecretBinary.ToArray());
            }
        }
    }
}
