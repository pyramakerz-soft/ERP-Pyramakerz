using LMS_CMS_DAL.Models.Domains.HR;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;

namespace LMS_CMS_PL.Services.Dashboard
{
    public class HR_Service
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public HR_Service(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }

        public decimal TotalSalaries(int year, int? month, HttpContext httpContext)
        {
            var unitOfWork = _dbContextFactory.CreateOneDbContext(httpContext);

            List<SalaryHistory> salaryHistories = unitOfWork.salaryHistory_Repository
                .FindBy(f =>
                    f.IsDeleted != true &&
                    f.Year == year &&
                    (month == null || f.Month == month)
                ).ToList();
             
            decimal totalSalaries = salaryHistories.Sum(s => s.NetSalary);

            return totalSalaries;
        }
    }
}
