namespace LMS_CMS_PL.Services.Zatca.Invoice
{
    public interface ISecretsService
    {
        Task<string> GetSecretAsync(string secretName);
    }
}
