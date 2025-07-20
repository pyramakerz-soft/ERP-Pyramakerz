using LMS_CMS_BL.DTO.Administration;
using Newtonsoft.Json;

namespace LMS_CMS_PL.Services
{
    public class IamNotRobot
    {
        public async Task<bool> VerifyRecaptcha(string token)
        {
            var secret = "6LeiYYkrAAAAAOnlOumIx2-MPE_zQmdUdEfqxSR3";
            var client = new HttpClient();
            var response = await client.PostAsync(
                $"https://www.google.com/recaptcha/api/siteverify?secret={secret}&response={token}",
                null);

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<RecaptchaResponse>(json);

            return result.Success;
        }
    }
}
