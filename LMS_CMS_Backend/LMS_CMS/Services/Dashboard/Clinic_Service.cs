using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.ClinicModule;

namespace LMS_CMS_PL.Services.Dashboard
{
    public class Clinic_Service
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public Clinic_Service(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }
        public long CountOfFollowUps(int year, int? month, HttpContext httpContext)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(httpContext);

            List<FollowUp> followUps = Unit_Of_Work.followUp_Repository.FindBy(
                    f => f.IsDeleted != true && f.Date.HasValue && f.Date.Value.Year == year && (month == null || f.Date.Value.Month == month));

            return followUps?.Count() ?? 0;
        }
    }
}
