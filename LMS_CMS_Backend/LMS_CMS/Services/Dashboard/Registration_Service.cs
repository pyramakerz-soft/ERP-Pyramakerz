using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Migrations.Octa;
using LMS_CMS_DAL.Models.Domains.ClinicModule;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;

namespace LMS_CMS_PL.Services.Dashboard
{
    public class Registration_Service
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public Registration_Service(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }

        public (int AcceptedCount, int DeclinedCount, int Pending, int WaitingListCount) RegistrationFormStateCount(int year, int? month, HttpContext httpContext)
        {
            var unitOfWork = _dbContextFactory.CreateOneDbContext(httpContext);
              
            List<RegisterationFormParent> registerationFormParents = unitOfWork.registerationFormParent_Repository
                .FindBy(f =>
                    f.IsFromRegistration == true &&
                    DateOnly.FromDateTime(f.InsertedAt.Value).Year == year && 
                    (month == null || DateOnly.FromDateTime(f.InsertedAt.Value).Month == month)
                ).ToList();

            int AcceptedCount = 0;
            int DeclinedCount = 0;
            int Pending = 0;
            int WaitingListCount = 0;

            foreach (var item in registerationFormParents)
            {
                switch (item.RegisterationFormStateID)
                {
                    case 1: 
                        Pending++;
                        break;
                    case 2:
                        AcceptedCount++;
                        break;
                    case 3:
                        DeclinedCount++;
                        break;
                    case 4:
                        WaitingListCount++;
                        break;
                }
            }

            return (AcceptedCount, DeclinedCount, Pending, WaitingListCount);
        }
    }
}
