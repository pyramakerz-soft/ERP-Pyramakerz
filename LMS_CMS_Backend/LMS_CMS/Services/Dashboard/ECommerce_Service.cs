using LMS_CMS_DAL.Models.Domains.ECommerce;
using LMS_CMS_DAL.Models.Domains.Inventory;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using ZXing;

namespace LMS_CMS_PL.Services.Dashboard
{
    public class ECommerce_Service
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public ECommerce_Service(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        } 

        public async Task<TopRequestedItemsByCategoryDTO> GetTopRequestedItemsByCategoryAsync(int year, int? month, HttpContext httpContext)
        {
            var unitOfWork = _dbContextFactory.CreateOneDbContext(httpContext);

            List<Order> orders = unitOfWork.order_Repository 
                .FindBy(f =>
                    f.IsDeleted != true && f.OrderStateID != 3 &&
                    DateOnly.FromDateTime(f.InsertedAt.Value).Year == year &&
                    (month == null || DateOnly.FromDateTime(f.InsertedAt.Value).Month == month)
                ) 
                .ToList();


            TopRequestedItemsByCategoryDTO topRequestedItemsByCategoryDTO = new TopRequestedItemsByCategoryDTO();
            topRequestedItemsByCategoryDTO.TotalOrders = orders.Count; 

            Dictionary<long, int> ItemCount = new Dictionary<long, int>();

            foreach (Order order in orders)
            {
                List<Cart_ShopItem> cart_ShopItems = unitOfWork.cart_ShopItem_Repository.FindBy(d => d.IsDeleted != true && d.CartID == order.CartID);
                if(cart_ShopItems != null)
                {
                    foreach (var cartItem in cart_ShopItems)
                    {
                        if (ItemCount.ContainsKey(cartItem.ShopItemID))
                        {
                            ItemCount[cartItem.ShopItemID] = ItemCount[cartItem.ShopItemID] + cartItem.Quantity;
                        }
                        else
                        {
                            ItemCount.Add(cartItem.ShopItemID, cartItem.Quantity);
                        }
                    }
                }
            }

            List<long> sortedItemCount = ItemCount.OrderByDescending(x => x.Value).Select(d => d.Key).ToList();

            Dictionary<long, int> CategoryCount = new Dictionary<long, int>();
            List<long> firstThreeItemsByCategory = new List<long>();

            List<ShopItem> allShopItems = await unitOfWork.shopItem_Repository.Select_All_With_IncludesById<ShopItem>(
                d => d.IsDeleted != true && sortedItemCount.Contains(d.ID),
                query => query.Include(d => d.InventorySubCategories)
                                .ThenInclude(d => d.InventoryCategories)
            );

            var shopItemMap = allShopItems.ToDictionary(d => d.ID);
             
            foreach (var itemId in sortedItemCount)
            {
                if (!shopItemMap.ContainsKey(itemId)) continue;
                var shopItem = shopItemMap[itemId];
                var categoryId = shopItem.InventorySubCategories.InventoryCategoriesID;

                if (CategoryCount.ContainsKey(categoryId))
                    CategoryCount[categoryId] += ItemCount[itemId];
                else
                {
                    firstThreeItemsByCategory.Add(itemId);
                    CategoryCount[categoryId] = ItemCount[itemId];
                    if (firstThreeItemsByCategory.Count == 3) break;
                }
            }
 
            foreach (var itemId in firstThreeItemsByCategory)
            {
                var shopItem = shopItemMap[itemId];
                var category = shopItem.InventorySubCategories.InventoryCategories;
                var categoryId = category.ID;

                topRequestedItemsByCategoryDTO.CategoryRanking.Add(new CategoryRankingDto
                {
                    CategoryID = categoryId,
                    CategoryName = category.Name,
                    TotalCategoryCount = CategoryCount[categoryId],
                    ShopItem = new ShopItemRankingDto
                    {
                        ItemID = shopItem.ID,
                        ItemName = shopItem.EnName,
                        TotalQuantitySold = ItemCount[shopItem.ID]
                    }
                });
            }

            return topRequestedItemsByCategoryDTO;
        } 

        public class TopRequestedItemsByCategoryDTO
        {
            public int TotalOrders { get; set; } 
            public List<CategoryRankingDto> CategoryRanking { get; set; } = new List<CategoryRankingDto>();
        }
        
        public class CategoryRankingDto
        {
            public long CategoryID { get; set; }
            public string CategoryName { get; set; }
            public int TotalCategoryCount { get; set; }
            public ShopItemRankingDto ShopItem { get; set; }
        }

        public class ShopItemRankingDto
        {
            public long ItemID { get; set; }
            public string ItemName { get; set; }
            public int TotalQuantitySold { get; set; } 
        } 
    }
}
