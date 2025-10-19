using LMS_CMS_DAL.Models.Domains.Inventory;

namespace LMS_CMS_PL.Services.Dashboard
{
    public class ECommerce_Service
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public ECommerce_Service(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }

        //public int TotalOrders(int year, int? month, HttpContext httpContext)
        //{
        //    var unitOfWork = _dbContextFactory.CreateOneDbContext(httpContext);

        //    List<ShopItem> shopItems= unitOfWork.shopItem_Repository
        //        .FindBy(f =>
        //            f.IsDeleted != true && 
        //            f.Date.Year == year &&
        //            (month == null || f.Date.Month == month)
        //        ).ToList();

        //    Dictionary<string, decimal> result = new Dictionary<string, decimal>();
             

        //    return result;
        //}
    }
}
