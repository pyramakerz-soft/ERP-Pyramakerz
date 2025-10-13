using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.ClinicModule;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;

namespace LMS_CMS_PL.Services.Dashboard
{
    public class Communication_Service
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public Communication_Service(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }
    }
}
