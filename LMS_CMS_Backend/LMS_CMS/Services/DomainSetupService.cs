using LMS_CMS_BL.DTO.Octa;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Text;
using System.Security.Cryptography;

namespace LMS_CMS_PL.Services.DomainSetUp
{
    public class DomainSetupService
    {
        private readonly UOW _unitOfWork;
        private readonly DynamicDatabaseService _dynamicDatabaseService;
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly GetConnectionStringService _getConnectionStringService;
        private readonly ILogger<DomainSetupService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        private readonly HashSet<long> _addedPageIds = new HashSet<long>();

        public DomainSetupService(
            UOW unitOfWork,
            DynamicDatabaseService dynamicDatabaseService,
            DbContextFactoryService dbContextFactory,
            GetConnectionStringService getConnectionStringService,
            ILogger<DomainSetupService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _dynamicDatabaseService = dynamicDatabaseService;
            _dbContextFactory = dbContextFactory;
            _getConnectionStringService = getConnectionStringService;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor; 
        }

        public async Task<DomainSetupResultDTO> RunDomainSetupAsync(DomainAdd_DTO domain, long userId)
        {
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            // Step 1: create DB + migrations
            //await _dynamicDatabaseService.AddDomainAndSetupDatabase(domain.Name, userId);

            // Step 2: connect to domain DB 
            var domainEx = _unitOfWork.domain_Octa_Repository.First_Or_Default_Octa(d => d.Name == domain.Name);
            string connStr = _getConnectionStringService.BuildConnectionString(domainEx.Name);

            // get the current HttpContext
            var context = _httpContextAccessor.HttpContext;
            context.Items["ConnectionString"] = connStr;

            // now you can create the UOW
            var unitOfWorkDomain = _dbContextFactory.CreateOneDbContext(context);
            // Step 3: Create Admin role
            Role role = new Role { Name = "Admin", InsertedByOctaId = userId, InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone) };
            unitOfWorkDomain.role_Repository.Add(role);
            unitOfWorkDomain.SaveChanges();

            // Step 4: Create Admin employee
            string plainPassword = GenerateSecurePassword(12);
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(plainPassword);

            Employee emp = new Employee
            {
                User_Name = "Admin",
                en_name = "Admin",
                Password = hashedPassword,
                Role_ID = role.ID,
                EmployeeTypeID = 1,
                InsertedByOctaId = userId,
                InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone),
                ConnectionStatusID = 1
            };
            unitOfWorkDomain.employee_Repository.Add(emp);
            unitOfWorkDomain.SaveChanges();

            // Step 5: Add Pages
            var notFoundPages = new List<long>();
            var notModulePages = new List<long>();

            foreach (var pageId in domain.Pages)
            {
                var page = _unitOfWork.page_Octa_Repository.Select_By_Id_Octa(pageId);
                if (page == null)
                {
                    notFoundPages.Add(pageId);
                }
                else if (page.Page_ID != null)
                {
                    notModulePages.Add(pageId);
                }
                else
                {
                    AddPageWithChildren(page, unitOfWorkDomain);
                }
            }

            foreach (var pageId in _addedPageIds)
            {
                Role_Detailes roleDetail = new Role_Detailes
                {
                    Role_ID = role.ID,
                    Page_ID = pageId,
                    Allow_Edit = true,
                    Allow_Delete = true,
                    Allow_Edit_For_Others = true,
                    Allow_Delete_For_Others = true,
                    InsertedByOctaId = userId,
                    InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone)
                };
                unitOfWorkDomain.role_Detailes_Repository.Add(roleDetail);
            }
            unitOfWorkDomain.SaveChanges();

            // Step 6: Add school types
            var schoolTypes = _unitOfWork.schoolType_Octa_Repository.Select_All_Octa();
            foreach (var item in schoolTypes)
            {
                var schoolType = new LMS_CMS_DAL.Models.Domains.LMS.SchoolType { Name = item.Name, ID = item.ID };
                unitOfWorkDomain.schoolType_Repository.Add(schoolType);
            }
            unitOfWorkDomain.SaveChanges();

            // Step 7: Call AWS to create subdomain
            string domainLink = await CreateSubdomainAsync(domain.Name);

            return new DomainSetupResultDTO
            {
                AdminUserName = "Admin",
                AdminPasswordPlain = plainPassword,
                DomainLink = domainLink,
                NotFoundPages = notFoundPages.Any() ? notFoundPages : null,
                NotModulePages = notModulePages.Any() ? notModulePages : null
            };
        }

        private void AddPageWithChildren(LMS_CMS_DAL.Models.Octa.Page page, UOW unitOfWork)
        {
            if (page == null || _addedPageIds.Contains(page.ID)) return;

            _addedPageIds.Add(page.ID);

            var alreadyExists = unitOfWork.page_Repository.Select_By_Id(page.ID);
            if (alreadyExists == null)
            {
                unitOfWork.page_Repository.Add(new LMS_CMS_DAL.Models.Domains.Page
                {
                    ID = page.ID,
                    en_name = page.en_name,
                    ar_name = page.ar_name,
                    Order = page.Order,
                    enDisplayName_name = page.enDisplayName_name,
                    arDisplayName_name = page.arDisplayName_name,
                    IsDisplay = page.IsDisplay,
                    Page_ID = page.Page_ID
                });
            }

            var childPages = _unitOfWork.domain_Octa_Repository.OctaDatabase().Page.Where(p => p.Page_ID == page.ID).ToList();
            foreach (var childPage in childPages)
            {
                AddPageWithChildren(childPage, unitOfWork);
            }
        }

        private string GenerateSecurePassword(int length)
        {
            const string allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*-_=+?";
            var password = new StringBuilder();
            using (var rng = RandomNumberGenerator.Create())
            {
                byte[] buffer = new byte[length];
                rng.GetBytes(buffer);
                foreach (var b in buffer)
                {
                    password.Append(allChars[b % allChars.Length]);
                }
            }
            return password.ToString();
        }

        private async Task<string> CreateSubdomainAsync(string domainName)
        {
            using var client = new HttpClient();
            var requestBody = new { subdomain = domainName };
            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync("https://8b1r2kegpb.execute-api.us-east-1.amazonaws.com/CreateSubDomain", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            var outerJson = JsonDocument.Parse(responseContent);
            if (outerJson.RootElement.TryGetProperty("body", out JsonElement bodyElement))
            {
                var innerJson = JsonDocument.Parse(bodyElement.GetString());
                if (innerJson.RootElement.TryGetProperty("message", out JsonElement messageElement))
                {
                    var match = Regex.Match(messageElement.GetString(), @"Subdomain (\S+) created successfully\.");
                    if (match.Success)
                    {
                        return match.Groups[1].Value;
                    }
                }
            }
            return null;
        }
    }
}
