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
        //public long FeesCalculated(int year, int? month, HttpContext httpContext)
        //{
        //    UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(httpContext);

        //    List<ReceivableMaster> receivableMasters = Unit_Of_Work.receivableMaster_Repository.FindBy(
        //            f => f.IsDeleted != true && f.Date.Year == year && (month == null || f.Date.Month == month));

        //    var amount = 0.0;
        //    if(receivableMasters != null)
        //    {
        //        foreach (var item in receivableMasters)
        //        {
        //            List<ReceivableDetails> receivableDetails = Unit_Of_Work.receivableDetails_Repository.FindBy(d => d.IsDeleted != true && d.LinkFileID == 13 && d.ReceivableMasterID == item.ID); 
        //            if( receivableDetails != null )
        //            {
        //                foreach (var item1 in receivableDetails)
        //                {
        //                    amount = amount + item1.Amount;
        //                }
        //            }
        //        }
        //    }

        //    return amount;
        //}
        //public decimal FeesCalculated(int year, int? month, HttpContext httpContext)
        //{
        //    var unitOfWork = _dbContextFactory.CreateOneDbContext(httpContext);

        //    // First, get all valid ReceivableMaster IDs matching the date
        //    var masterIds = unitOfWork.ReceivableMaster_Repository
        //        .FindBy(f =>
        //            !f.IsDeleted &&
        //            f.Date.Year == year &&
        //            (month == null || f.Date.Month == month)
        //        )
        //        .Select(f => f.ID)
        //        .ToList();

        //    // Then get all matching ReceivableDetails in one query
        //    var receivableDetails = unitOfWork.ReceivableDetails_Repository
        //        .FindBy(d =>
        //            !d.IsDeleted &&
        //            d.LinkFileID == 13 &&
        //            masterIds.Contains(d.ReceivableMasterID)
        //        );

        //    // Sum directly using LINQ
        //    var amount = receivableDetails.Sum(d => d.Amount);

        //    return amount;
        //}

    }
}
