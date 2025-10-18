using Azure.Core;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Communication; 

namespace LMS_CMS_PL.Services.Dashboard
{
    public class Communication_Service
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public Communication_Service(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }


        public (int AcceptedCount, int DeclinedCount, int Pending) RequestStateCount(int year, int? month, HttpContext httpContext)
        {
            var unitOfWork = _dbContextFactory.CreateOneDbContext(httpContext);

            List<LMS_CMS_DAL.Models.Domains.Communication.Request> requests = unitOfWork.request_Repository
                .FindBy(f =>
                    f.ForwardedOrNot != true && f.IsDeleted != true &&
                    DateOnly.FromDateTime(f.InsertedAt.Value).Year == year &&
                    (month == null || DateOnly.FromDateTime(f.InsertedAt.Value).Month == month)
                ).ToList();

            int AcceptedCount = 0;
            int DeclinedCount = 0;
            int Pending = 0; 

            foreach (var item in requests)
            {
                switch (item.ApprovedOrNot)
                {
                    case true:
                        AcceptedCount++;
                        break;
                    case false:
                        DeclinedCount++;
                        break;
                    case null:
                        Pending++;
                        break; 
                }
            }

            return (AcceptedCount, DeclinedCount, Pending);
        }
    }
}
