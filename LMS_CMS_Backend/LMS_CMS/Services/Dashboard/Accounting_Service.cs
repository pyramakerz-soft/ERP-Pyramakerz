using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.ClinicModule;

namespace LMS_CMS_PL.Services.Dashboard
{
    public class Accounting_Service
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public Accounting_Service(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        } 

        public decimal FeesCalculated(int year, int? month, HttpContext httpContext)
        {
            var unitOfWork = _dbContextFactory.CreateOneDbContext(httpContext);
             
            List<long> masterIds = unitOfWork.receivableMaster_Repository
                .FindBy(f =>
                    f.IsDeleted != true &&
                    f.Date.Year == year &&
                    (month == null || f.Date.Month == month)
                )
                .Select(f => f.ID)
                .ToList();
             
            List<ReceivableDetails> receivableDetails = unitOfWork.receivableDetails_Repository
                .FindBy(d =>
                    d.IsDeleted != true &&
                    d.LinkFileID == 13 &&
                    masterIds.Contains(d.ReceivableMasterID)
                );
             
            var amount = receivableDetails.Sum(d => d.Amount);

            return amount;
        }

    }
}
