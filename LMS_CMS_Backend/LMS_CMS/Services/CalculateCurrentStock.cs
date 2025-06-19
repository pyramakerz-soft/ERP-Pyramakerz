using LMS_CMS_DAL.Models.Domains;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace LMS_CMS_PL.Services
{
    public class CalculateCurrentStock
    {
        public async Task<int> GetCurrentStock(LMS_CMS_Context db, long storeId, long shopItemId, string date)
        {
            if (DateTime.TryParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime parsedDate))
            {
                date = parsedDate.ToString("dd/MM/yyyy"); // keep this line as-is
            }
            var compareDate = DateTime.ParseExact(date, "dd/MM/yyyy", CultureInfo.InvariantCulture).ToString("yyyy-MM-dd");

            var totalStock = await (from details in db.InventoryDetails
                                    join master in db.InventoryMaster on details.InventoryMasterId equals master.ID
                                    join flag in db.InventoryFlags on master.FlagId equals flag.ID
                                    where master.StoreID == storeId
                                          && details.ShopItemID == shopItemId
                                          && master.Date.Substring(0, 10).CompareTo(compareDate) <= 0
                                          && master.IsDeleted != true
                                          && details.IsDeleted != true
                                    select details.Quantity * flag.ItemInOut
                                   ).SumAsync();

            return totalStock;
        }

        //////
        public async Task<int> GetCurrentStockInTransformedStore(LMS_CMS_Context db, long storeId, long shopItemId, string date)
        {
            if (DateTime.TryParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime parsedDate))
            {
                date = parsedDate.ToString("dd/MM/yyyy"); // keep this as requested
            }

            // Convert date back to yyyy-MM-dd to match Substring(0,10) output
            var compareDate = DateTime.ParseExact(date, "dd/MM/yyyy", CultureInfo.InvariantCulture).ToString("yyyy-MM-dd");

            var totalStock = await (from details in db.InventoryDetails
                                    join master in db.InventoryMaster on details.InventoryMasterId equals master.ID
                                    join flag in db.InventoryFlags on master.FlagId equals flag.ID
                                    where master.StoreToTransformId == storeId
                                          && details.ShopItemID == shopItemId
                                          && master.Date.Substring(0, 10).CompareTo(compareDate) <= 0
                                          && master.IsDeleted != true
                                          && details.IsDeleted != true
                                    select details.Quantity * 1
                                   ).SumAsync();

            return totalStock;
        }

    }
}
