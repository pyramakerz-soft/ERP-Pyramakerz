using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.HR;
using LMS_CMS_DAL.Models.Domains.Inventory;

namespace LMS_CMS_PL.Services.Dashboard
{
    public class Inventory_Service
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly CalculateCurrentStock _calculateCurrentStock;

        public Inventory_Service(DbContextFactoryService dbContextFactory, CalculateCurrentStock calculateCurrentStock)
        {
            _dbContextFactory = dbContextFactory;
            _calculateCurrentStock = calculateCurrentStock;
        }

        public async Task<int> LowItemsAsync(HttpContext httpContext)
        { 
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            DateTime cairoTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, cairoZone);
            DateOnly todayDate = DateOnly.FromDateTime(cairoTime);

            var unitOfWork = _dbContextFactory.CreateOneDbContext(httpContext);
            LMS_CMS_Context db = unitOfWork.inventoryMaster_Repository.Database();

            List<ShopItem> shopItems = unitOfWork.shopItem_Repository
                .FindBy(f =>
                    f.IsDeleted != true
                ).ToList();

            int LowItems = 0;

            foreach (var item in shopItems)
            {
                int CurrentStockInAllStores = await _calculateCurrentStock.GetCurrentStockInAllStores(db, item.ID, todayDate);
                int CurrentStockInTransformedStoreInAllStores = await _calculateCurrentStock.GetCurrentStockInTransformedStoreInAllStores(db, item.ID, todayDate);

                if(CurrentStockInAllStores + CurrentStockInTransformedStoreInAllStores < item.Limit)
                {
                    LowItems++;
                }
            }
             
            return LowItems;
        }
         
        public Dictionary<string, decimal> Purchase(int year, int? month, HttpContext httpContext)
        {
            var unitOfWork = _dbContextFactory.CreateOneDbContext(httpContext);

            List<InventoryMaster> inventoryMasters = unitOfWork.inventoryMaster_Repository
                .FindBy(f =>
                    f.IsDeleted != true &&
                    f.FlagId == 9 &&
                    f.Date.Year == year &&
                    (month == null || f.Date.Month == month)
                ).ToList();

            Dictionary<string, decimal> result = new Dictionary<string, decimal>();

            if (month == null)
            { 
                var grouped = inventoryMasters
                    .GroupBy(i => i.Date.Month)
                    .ToDictionary(g => g.Key, g => g.Sum(i => i.Total));

                // Fill missing months with 0
                for (int m = 1; m <= 12; m++)
                {
                    string monthName = new DateTime(year, m, 1).ToString("MMM");
                    result[monthName] = grouped.ContainsKey(m) ? grouped[m] : 0;
                }
            }
            else
            {
                int daysInMonth = DateTime.DaysInMonth(year, month.Value);

                var grouped = inventoryMasters
                    .GroupBy(i => i.Date.Day)
                    .ToDictionary(g => g.Key, g => g.Sum(i => i.Total));
                 
                for (int d = 1; d <= daysInMonth; d++)
                {
                    result[$"Day {d}"] = grouped.ContainsKey(d) ? grouped[d] : 0;
                }
            }

            return result;
        }
        
        public Dictionary<string, decimal> Sales(int year, int? month, HttpContext httpContext)
        {
            var unitOfWork = _dbContextFactory.CreateOneDbContext(httpContext);

            List<InventoryMaster> inventoryMasters = unitOfWork.inventoryMaster_Repository
                .FindBy(f =>
                    f.IsDeleted != true &&
                    f.FlagId == 11 &&
                    f.Date.Year == year &&
                    (month == null || f.Date.Month == month)
                ).ToList();

            Dictionary<string, decimal> result = new Dictionary<string, decimal>();

            if (month == null)
            { 
                var grouped = inventoryMasters
                    .GroupBy(i => i.Date.Month)
                    .ToDictionary(g => g.Key, g => g.Sum(i => i.Total));

                // Fill missing months with 0
                for (int m = 1; m <= 12; m++)
                {
                    string monthName = new DateTime(year, m, 1).ToString("MMM");
                    result[monthName] = grouped.ContainsKey(m) ? grouped[m] : 0;
                }
            }
            else
            {
                int daysInMonth = DateTime.DaysInMonth(year, month.Value);

                var grouped = inventoryMasters
                    .GroupBy(i => i.Date.Day)
                    .ToDictionary(g => g.Key, g => g.Sum(i => i.Total));
                 
                for (int d = 1; d <= daysInMonth; d++)
                {
                    result[$"Day {d}"] = grouped.ContainsKey(d) ? grouped[d] : 0;
                }
            }

            return result;
        }
    }
}
