using AutoMapper;
using LMS_CMS_BL.DTO.Inventory;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Inventory;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace LMS_CMS_PL.Controllers.Domains.Inventory
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class InventoryDetailsController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public InventoryDetailsController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Inventory" }
        )]
        public async Task<IActionResult> GetAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<InventoryDetails> salesItems = await Unit_Of_Work.inventoryDetails_Repository.Select_All_With_IncludesById<InventoryDetails>(
                    f => f.IsDeleted != true,
                    query => query.Include(s => s.ShopItem),
                    query => query.Include(s => s.InventoryMaster) 
                    );

            if (salesItems == null || salesItems.Count == 0)
            {
                return NotFound();
            }

            List<InventoryDetailsGetDTO> DTO = mapper.Map<List<InventoryDetailsGetDTO>>(salesItems);

            return Ok(DTO);
        }

        /// //////////////////////////////////////////////////////////////////////--77
        [HttpGet("inventory-net-combined")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Item Card Report", "Item Card Report With Average" })]
        public async Task<IActionResult> GetInventoryNetCombinedAsync(long storeId, long shopItemId, DateOnly fromDate, DateOnly toDate)
        {
            try
            {
                var summaryResult = await GetInventoryNetSummaryInternalAsync(storeId, shopItemId, fromDate);
                var transactionsResult = await GetInventoryNetTransactionsInternalAsync(storeId, shopItemId, fromDate, toDate);

                var result = new
                {
                    Summary = summaryResult,
                    Transactions = transactionsResult
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        private async Task<InventoryNetSummaryDTO> GetInventoryNetSummaryInternalAsync(long storeId, long shopItemId, DateOnly toDate)
        {
            var Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var flagsToExclude = new long[] { 13 };

            var data = await Unit_Of_Work.inventoryDetails_Repository
                .Select_All_With_IncludesById<InventoryDetails>(
                    d => d.InventoryMaster != null &&
                         d.InventoryMaster.IsDeleted != true &&
                         d.IsDeleted != true &&
                         d.ShopItemID == shopItemId &&
                         (d.InventoryMaster.StoreID == storeId ||
                          (d.InventoryMaster.FlagId == 8 && d.InventoryMaster.StoreToTransformId == storeId)),
                    q => q.Include(d => d.InventoryMaster)
                          .ThenInclude(im => im.InventoryFlags));

            var filteredData = data
                .Where(d =>
                    d.InventoryMaster.Date <= toDate &&
                    !flagsToExclude.Contains(d.InventoryMaster.FlagId) &&
                    d.InventoryMaster.InventoryFlags != null &&
                    d.InventoryMaster.InventoryFlags.ItemInOut != 0)
                    .OrderBy(d => d.InventoryMaster.Date)
                .ToList();

            var inQuantity = filteredData
                .Where(d => d.InventoryMaster.InventoryFlags.ItemInOut == 1)
                .Sum(d => d.Quantity);

            var outQuantity = filteredData
                .Where(d => d.InventoryMaster.InventoryFlags.ItemInOut == -1)
                .Sum(d => d.Quantity);

            var quantityBalance = inQuantity - outQuantity;

            var costBalance = filteredData
                .Sum(d => d.AverageCost * d.InventoryMaster.InventoryFlags.ItemInOut);

            return new InventoryNetSummaryDTO
            {
                ShopItemId = shopItemId,
                StoreId = storeId,
                ToDate = toDate.AddDays(-1),
                InQuantity = quantityBalance > 0 ? quantityBalance : 0,
                outQuantity = quantityBalance < 0 ? -quantityBalance : 0,
                Quantitybalance = quantityBalance,
                CostBalance = costBalance
            };
        }


        private async Task<List<InventoryNetTransactionDTO>> GetInventoryNetTransactionsInternalAsync(long storeId, long shopItemId, DateOnly fromDate, DateOnly toDate)
        {
            var parsedFromDate = fromDate;
            var parsedToDate = toDate;

            if (parsedFromDate > parsedToDate)
                throw new ArgumentException("The start date cannot be after the end date.");

            var Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var flagsToExclude = new long[] { 13 };

            var allData = await Unit_Of_Work.inventoryDetails_Repository
                .Select_All_With_IncludesById<InventoryDetails>(
                    d => d.InventoryMaster != null &&
                         d.InventoryMaster.IsDeleted != true &&
                         d.IsDeleted != true &&
                         d.ShopItemID == shopItemId &&
                         (d.InventoryMaster.StoreID == storeId ||
                          (d.InventoryMaster.FlagId == 8 && d.InventoryMaster.StoreToTransformId == storeId)),
                    q => q.Include(d => d.InventoryMaster).ThenInclude(m => m.InventoryFlags),
                    q => q.Include(d => d.InventoryMaster.Supplier),
                    q => q.Include(d => d.InventoryMaster.Student),
                    q => q.Include(d => d.InventoryMaster.Store),
                    q => q.Include(d => d.InventoryMaster.StoreToTransform));

                var previousBalance = allData
                .Where(d =>
                    d.InventoryMaster.Date < parsedFromDate &&
                    !flagsToExclude.Contains(d.InventoryMaster.FlagId) &&
                    d.InventoryMaster.InventoryFlags.ItemInOut != 0)
                .Sum(d => d.Quantity * d.InventoryMaster.InventoryFlags.ItemInOut);

                var transactionData = allData
                .Where(d =>
                    d.InventoryMaster.Date >= parsedFromDate &&
                    d.InventoryMaster.Date <= parsedToDate)
                .OrderBy(d => d.InventoryMaster.Date)
                .ToList();

            var runningBalance = previousBalance;
            var transactions = new List<InventoryNetTransactionDTO>();

            foreach (var d in transactionData)
            {
                var itemInOut = d.InventoryMaster.InventoryFlags.ItemInOut;
                var signedQty = d.Quantity * itemInOut;
                runningBalance += signedQty;

                transactions.Add(new InventoryNetTransactionDTO
                {
                    Date = d.InventoryMaster.Date,
                    FlagId = d.InventoryMaster.FlagId,
                    FlagName = d.InventoryMaster.InventoryFlags.enName,
                    InvoiceNumber = d.InventoryMaster.InvoiceNumber,
                    Notes = d.InventoryMaster.Notes,
                    Quantity = d.Quantity,
                    inQuantity = d.Quantity * (itemInOut == 1 ? 1 : 0),
                    outQuantity = d.Quantity * (itemInOut == -1 ? 1 : 0),
                    Balance = runningBalance,
                    Price = d.Price,
                    TotalPrice = d.TotalPrice,
                    AverageCost = d.AverageCost,
                    ItemInOut = itemInOut,
                    SupplierName = (new long[] { 9, 10, 13 }.Contains(d.InventoryMaster.FlagId)) ? d.InventoryMaster.Supplier?.Name : null,
                    StudentName = (new long[] { 11, 12 }.Contains(d.InventoryMaster.FlagId)) ? d.InventoryMaster.Student?.en_name : null,
                    StoreName = d.InventoryMaster.Store?.Name,
                    StoreToName = (d.InventoryMaster.FlagId == 8) ? d.InventoryMaster.StoreToTransform?.Name : null
                });
            }
            return transactions;
        }

        //////////////////////////////////////////////////////////////////////////////////////-777
        [HttpGet("AverageCost")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Average Cost Calculation" }
        )]
        public async Task<IActionResult> CalculateAverageCostAsync(DateOnly? fromDate, DateOnly? toDate)
        {
            if (!fromDate.HasValue || !toDate.HasValue)
                return BadRequest(new { message = "You should plan a starting date." });

            var parsedFromDate = fromDate.Value;
            var parsedToDate = toDate.Value;

            if (parsedFromDate > parsedToDate)
                return BadRequest("The start date cannot be after the end date.");

            var Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
         var allInventoryData = await Unit_Of_Work.inventoryMaster_Repository
        .Select_All_With_IncludesById<InventoryMaster>(
            im => im.IsDeleted != true &&
            im.Date >= parsedFromDate && im.Date <= parsedToDate,
            query => query
            .Include(im => im.InventoryDetails)
            .Include(im => im.InventoryFlags));

            // ========== المرحلة 1: تصفير AverageCost ==========
            foreach (var item in allInventoryData.SelectMany(im => im.InventoryDetails))
            {
                item.AverageCost = 0;
                //Unit_Of_Work.inventoryDetails_Repository.Update(item);
            }

            // ========== المرحلة 2: Opening Balance & Purchases ==========
            foreach (var item in allInventoryData
                        .Where(im => im.FlagId == 1 || im.FlagId == 9)
                        .SelectMany(im => im.InventoryDetails))
            {
                item.AverageCost = item.TotalPrice;
                //Unit_Of_Work.inventoryDetails_Repository.Update(item);
            }
            await Unit_Of_Work.SaveChangesAsync();
            // ========== المرحلة 3: الحركات اليومية ==========
            var currentDate = parsedFromDate;
            while (currentDate <= parsedToDate)
            {
                var dailyItems = allInventoryData
                    .Where(im => im.FlagId != 1 && im.FlagId != 9 && im.Date == currentDate)
                    .SelectMany(im => im.InventoryDetails);

                foreach (var item in dailyItems)
                {
                    decimal? averageCost = await CalculateAverageCostForItem(item.ShopItemID, currentDate);
                    item.AverageCost = (averageCost * item.Quantity) ?? 0;
                    Unit_Of_Work.inventoryDetails_Repository.Update(item);
                }
                await Unit_Of_Work.SaveChangesAsync();
                currentDate = currentDate.AddDays(1);
            }
            return Ok(new { message = "Average cost calculation completed." });
        }

        // /////////////////////////////////////////////////////////////-7
        private async Task<decimal> CalculateAverageCostForItem(long shopItemId, DateOnly targetDate)
        {
            var Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var dbItems = await Unit_Of_Work.inventoryDetails_Repository
                .Query()
                .Include(id => id.InventoryMaster)
                    .ThenInclude(im => im.InventoryFlags)
                .Where(id =>
                    id.InventoryMaster.IsDeleted != true &&
                    id.ShopItemID == shopItemId &&
                    id.InventoryMaster.InventoryFlags.ItemInOut != 0 &&
                    (
                        id.InventoryMaster.Date < targetDate || 
                        (id.InventoryMaster.Date == targetDate && 
                         (id.InventoryMaster.FlagId == 1 || id.InventoryMaster.FlagId == 9))
                    ))
                .ToListAsync();

            if (!dbItems.Any())
                return 0;

            decimal totalWeightedCost = dbItems.Sum(id =>
                id.InventoryMaster.InventoryFlags.ItemInOut * (id.AverageCost ?? 0));

            decimal totalQuantity = dbItems.Sum(id =>
                id.InventoryMaster.InventoryFlags.ItemInOut * id.Quantity);

            if (totalQuantity == 0)
                return 0;

            return totalWeightedCost / totalQuantity;
        }
        //////////////////////////////////////////////////////////////////////////////////////////-777
   
        [HttpGet("StoreBalance")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, 
            pages: new[] { "Store Items Balance" , "Store Items Balance with Purchase" , "Store Items Balance with Sales"
        , "Store Items Balance with Average Cost" , "Store Limited Items"})]
        public async Task<IActionResult> GetStoreBalanceAsync(
        long storeId, DateOnly toDate, int ReportFlagType, int categoryId = 0, int typeId = 0,
        bool hasBalance = false, bool overdrawnBalance = false, bool zeroBalances = false)
        {  
            if (storeId == 0)
                return BadRequest("StoreId is required");

            var parsedToDate = toDate;
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var data = await Unit_Of_Work.inventoryDetails_Repository
                .Select_All_With_IncludesById<InventoryDetails>(
                    id => id.InventoryMaster.Store.ID == storeId &&
                          id.InventoryMaster.Date <= parsedToDate &&
                          id.IsDeleted != true &&
                          id.InventoryMaster.IsDeleted != true,
                    q => q.Include(id => id.InventoryMaster)
                          .ThenInclude(im => im.InventoryFlags),
                    q => q.Include(id => id.ShopItem)
                          .ThenInclude(si => si.InventorySubCategories)
                          .ThenInclude(sub => sub.InventoryCategories));

            if (data == null || data.Count == 0)
                return NotFound("No inventory items found.");

            var storeCategories = Unit_Of_Work.storeCategories_Repository
                .Select_All()
                .Where(sc => sc.StoreID == storeId && sc.IsDeleted != true)
                .ToList();

            var filtered = data.Where(id =>
                (categoryId == 0 || id.ShopItem.InventorySubCategories.InventoryCategoriesID == categoryId) &&
                (typeId == 0 || id.ShopItem.InventorySubCategoriesID == typeId) &&
          
                (typeId != 0 || storeCategories.Select(sc => sc.InventoryCategoriesID)
                .Contains(id.ShopItem.InventorySubCategories.InventoryCategoriesID)) &&
                (id.InventoryMaster.InventoryFlags.ItemInOut == 1 || id.InventoryMaster.InventoryFlags.ItemInOut == -1));

            var groupedData = filtered
                .GroupBy(id => new
                {
                    id.ShopItem.ID,
                    id.ShopItem.EnName,
                    id.ShopItem.PurchasePrice,
                    id.ShopItem.SalesPrice,
                    id.ShopItem.Limit
                })
                .Select(g =>
                { 
                    var quantity = g.Sum(id => id.Quantity * id.InventoryMaster.InventoryFlags.ItemInOut);
                    var totalCost = g.Sum(id => id.AverageCost * id.InventoryMaster.InventoryFlags.ItemInOut);
                    var averageCost = quantity != 0 ? totalCost / quantity : (decimal?)null;
                    var limit = g.Key.Limit;
                  
                    return new StoreBalanceReportDto
                    {
                        ItemCode = g.Key.ID,
                        ItemName = g.Key.EnName,
                        Quantity = quantity,
                        AverageCost = averageCost,
                        PurchasePrice = g.Key.PurchasePrice,
                        TotalPurchase = quantity * g.Key.PurchasePrice,
                        SalesPrice = g.Key.SalesPrice,
                        TotalSales = quantity * g.Key.SalesPrice,
                        TotalCost = totalCost,
                        Limit = g.Key.Limit,
                    };
                })
               .Where(x =>
                    (hasBalance && x.Quantity > 0) ||
                    (overdrawnBalance && x.Quantity < 0) ||
                    (zeroBalances && x.Quantity == 0)
                )
               .OrderBy(x => x.ItemCode) 
                .ToList();

               object result;
                switch (ReportFlagType)
                {
                case 1:
                    result = new
                    {
                        ReportType = "Quantity Only",
                        Data = groupedData.Select(x => new { x.ItemCode, x.ItemName, x.Quantity })
                    };
                    break;

                case 2:
                    result = new
                    {
                        ReportType = "Purchase Price",
                        Data = groupedData
                            .Where(x => x.PurchasePrice.HasValue)
                            .Select(x => new { x.ItemCode, x.ItemName, x.Quantity, x.PurchasePrice, x.TotalPurchase })
                    };
                    break;

                case 3:
                    result = new
                    {
                        ReportType = "Sales Price",
                        Data = groupedData
                            .Where(x => x.SalesPrice.HasValue)
                            .Select(x => new { x.ItemCode, x.ItemName, x.Quantity, x.SalesPrice, x.TotalSales })
                    };
                    break;

                case 4:
                    result = new
                    {
                        ReportType = "Cost",
                        Data = groupedData.Select(x => new { x.ItemCode, x.ItemName, x.Quantity, x.AverageCost, x.TotalCost })
                    };
                    break;

                case 5:
                    var underLimitItems = groupedData
                        .Where(x => x.Quantity <= x.Limit)
                        .Select(x => new { x.ItemCode, x.ItemName, x.Quantity, x.Limit, x.AlertMessage })
                        .ToList();

                    result = new
                    {
                        ReportType = "Items Under Limit",
                        Data = underLimitItems
                    };
                    break;

                default:
                    return BadRequest("Invalid Report Flag Type value.");
                }

                return Ok(result);
         }

        /////////////////////////////////////////////////////////////////////////////////////////////////////////-777

        [HttpGet("AllStoresBalanceHorizontal")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, 
            pages: new[] { "All Stores Item Balance" , "All Stores Item Balance with Purchase" ,
                "All Stores Item Balance with Sales", "All Stores Item Balance with Average Cost" })]
        public async Task<IActionResult> GetAllStoresBalanceHorizontalAsync(
        DateOnly toDate, int reportType = 1, int categoryId = 0, int typeId = 0,
        bool hasBalance = false, bool overdrawnBalance = false, bool zeroBalances = false)
        {
            if (toDate == default)
                return BadRequest("ToDate is required");

            DateOnly parsedToDate = toDate;
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var data = await Unit_Of_Work.inventoryDetails_Repository
                .Select_All_With_IncludesById<InventoryDetails>(
                    id => id.InventoryMaster.Date <= parsedToDate &&
                          id.IsDeleted != true &&
                          id.InventoryMaster.IsDeleted != true,
                    q => q.Include(id => id.InventoryMaster)
                          .ThenInclude(im => im.InventoryFlags),
                    q => q.Include(id => id.InventoryMaster)
                          .ThenInclude(im => im.Store),
                    q => q.Include(id => id.ShopItem)
                          .ThenInclude(si => si.InventorySubCategories)
                          .ThenInclude(sub => sub.InventoryCategories));

            if (data == null || data.Count == 0)
                return NotFound("No inventory items found.");

            var storeCategories = Unit_Of_Work.storeCategories_Repository
                .Select_All()
                .Where(sc => sc.IsDeleted != true)
                .ToList();

                var filtered = data.Where(id =>
                (categoryId == 0 || id.ShopItem.InventorySubCategories.InventoryCategoriesID == categoryId) &&
                (typeId == 0 || id.ShopItem.InventorySubCategoriesID == typeId) &&
                (typeId != 0 || storeCategories
                    .Where(sc => sc.StoreID == id.InventoryMaster.Store.ID)
                    .Select(sc => sc.InventoryCategoriesID)
                    .Contains(id.ShopItem.InventorySubCategories.InventoryCategoriesID)) &&
                (id.InventoryMaster.InventoryFlags.ItemInOut == 1 || id.InventoryMaster.InventoryFlags.ItemInOut == -1));

                var storeItems = filtered
                .GroupBy(id => new
                {
                    ItemId = id.ShopItem.ID,
                    ItemName = id.ShopItem.EnName,
                    StoreId = id.InventoryMaster.Store.ID,
                    StoreName = id.InventoryMaster.Store.Name
                })
                .Select(g =>
                {
                    var quantity = g.Sum(id => id.Quantity * id.InventoryMaster.InventoryFlags.ItemInOut);
                    var totalCost = g.Sum(id => id.AverageCost * id.InventoryMaster.InventoryFlags.ItemInOut);
                    var averageCost = quantity != 0 ? totalCost / quantity : (decimal?)null;

                    var totalPurchaseValue = (decimal?)(quantity * g.First().ShopItem.PurchasePrice);
                    var totalSalesValue = (decimal?)(quantity * g.First().ShopItem.SalesPrice);

                    return new
                    {
                        g.Key.ItemId,
                        g.Key.ItemName,
                        g.Key.StoreId,
                        g.Key.StoreName,
                        Quantity = quantity,
                        PurchasePrice = g.First().ShopItem.PurchasePrice,
                        TotalPurchaseValue = totalPurchaseValue,
                        SalesPrice = g.First().ShopItem.SalesPrice,
                        TotalSalesValue = totalSalesValue,
                        AverageCost = averageCost,
                        TotalCost = totalCost
                    };
                })
                .Where(x =>
                    (hasBalance && x.Quantity > 0) ||
                    (overdrawnBalance && x.Quantity < 0) ||
                    (zeroBalances && x.Quantity == 0))
                .ToList();

            var uniqueStores = storeItems.Select(x => new { x.StoreId, x.StoreName }).Distinct().ToList();
            var uniqueItems = storeItems.Select(
                x => new 
                { x.ItemId, x.ItemName }).Distinct().OrderBy(x => x.ItemId).ToList();

            var horizontalReport = new List<object>();

            foreach (var item in uniqueItems)
            {
                var itemStores = storeItems.Where(
                    x => x.ItemId == item.ItemId).ToList();
                var itemReport = new Dictionary<string, object>
                {
                    { "itemCode", item.ItemId },
                    { "itemName", item.ItemName}
                };


                var stores = new List<object>();
                foreach (var store in uniqueStores)
                {
                    var storeData = itemStores.FirstOrDefault(x => x.StoreId == store.StoreId);
                    var storeEntry = new Dictionary<string, object>
                {
                    {"storeName", store.StoreName },
                    {"quantity", decimal.Round((storeData?.Quantity ?? 0m), 2)}

                };

                    if (storeData != null)
                    {
                        switch (reportType)
                        {
                            case 1: // QuantityOnly
                                break;
                            case 2: // PurchasePrice
                                storeEntry["PurchasePrice"] = Math.Round(storeData.PurchasePrice, 2);
                                storeEntry["value"] = Math.Round(storeData.TotalPurchaseValue ?? 0, 2);
                                break;
                            case 3: // SalesPrice
                                storeEntry["SalesPrice"] = Math.Round(storeData.SalesPrice, 2);
                                storeEntry["value"] = Math.Round(storeData.TotalSalesValue ?? 0, 2);
                                break;
                            case 4: // CostValue
                                storeEntry["AverageCost"] = Math.Round(storeData.AverageCost ?? 0, 2);
                                storeEntry["value"] = Math.Round(storeData.TotalCost ?? 0, 2);
                                break;
                        }
                    }
                    else
                    {
                        if (reportType != 1)
                        {
                            storeEntry["price"] = 0.00m;
                            storeEntry["value"] = 0.00m;
                        }
                    }
                    stores.Add(storeEntry);
                }

                decimal totalQuantityToItem = stores.Sum(s => (decimal)((Dictionary<string, object>)s)["quantity"]);
                decimal totalValueToItem = 0;

                if (reportType == 1)
                {
                    totalValueToItem = totalQuantityToItem;
                }
                else
                {
                    totalValueToItem = stores.Sum(s => (decimal)((Dictionary<string, object>)s)["value"]);
                }

                itemReport["stores"] = stores;

                if (reportType != 1)
                    itemReport["TotalQuantityToItem"] = Math.Round(totalQuantityToItem, 2);

                itemReport["TotalValueToItem"] = Math.Round(totalValueToItem, 2);

                horizontalReport.Add(itemReport);
            }

            var grandTotals = new Dictionary<string, object>
            {
                    { "TotalQuantity", horizontalReport.Sum(x => ((List<object>)((Dictionary<string, object>)x)["stores"]).Sum(s =>
                        (decimal)((Dictionary<string, object>)s)["quantity"]))
                    }
            };

            if (reportType != 1)
            {
                grandTotals["TotalValue"] = horizontalReport.Sum(x => ((List<object>)((Dictionary<string, object>)x)["stores"]).Sum(s =>
                    (decimal)((Dictionary<string, object>)s)["value"]));
            }

            var result = new
            {
                ReportType = GetReportTypeName(reportType),
                Data = horizontalReport,
                GrandTotals = grandTotals
            };

            return Ok(result);
        }

        private string GetReportTypeName(int reportType)
        {
            return reportType switch
            {
                1 => "QuantityOnly",
                2 => "PurchasePrice",
                3 => "SalesPrice",
                4 => "CostValue",
                _ => "Unknown"
            };
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////-777

        [HttpGet("BySaleId/{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Inventory" }
        )]
        public async Task<IActionResult> GetBySaleIDAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<InventoryDetails> salesItems = await Unit_Of_Work.inventoryDetails_Repository.Select_All_With_IncludesById<InventoryDetails>
                ( f => f.IsDeleted != true&&
                    f.InventoryMasterId==id,
                    query => query.Include(s => s.ShopItem),
                    query => query.Include(s => s.InventoryMaster)
                );

            if (salesItems == null || salesItems.Count == 0)
            {
                return NotFound();
            }

            List<InventoryDetailsGetDTO> DTO = mapper.Map<List<InventoryDetailsGetDTO>>(salesItems);

            return Ok(DTO);
        }

        /// /////////////////////////////////////////////////////////////////////////////////////////////


        [HttpGet("{id}")]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" },
        pages: new[] { "Inventory" }
        )]
        public async Task<IActionResult> GetByIDAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            InventoryDetails salesItems = await Unit_Of_Work.inventoryDetails_Repository.FindByIncludesAsync(
                    f => f.IsDeleted != true &&
                    f.ID == id,
                    query => query.Include(s => s.ShopItem),
                    query => query.Include(s => s.InventoryMaster)
                    );

            if (salesItems == null )
            {
                return NotFound();
            }

            InventoryDetailsGetDTO DTO = mapper.Map<InventoryDetailsGetDTO>(salesItems);

            return Ok(DTO);
        }

        ////

        [HttpPost]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Inventory" }
    )]
        public async Task<IActionResult> Add([FromBody] List<InventoryDetailsGetDTO> newItems)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }
            foreach (var newItem in newItems)
            {
            if (newItem == null)
            {
                return BadRequest("Sales Item cannot be null");
            }

            ShopItem shopItem = Unit_Of_Work.shopItem_Repository.First_Or_Default(s => s.ID == newItem.ShopItemID && s.IsDeleted != true);
            if (shopItem == null)
            {
                return NotFound();
            }

            InventoryMaster InventoryMaster = Unit_Of_Work.inventoryMaster_Repository.First_Or_Default(s => s.ID == newItem.InventoryMasterId && s.IsDeleted != true);
            if (InventoryMaster == null)
            {
                return NotFound();
            }

            foreach (var item in newItems)
            {
                if (item.SalesId == 0)
                {
                    item.SalesId = null;
                }
            }

            InventoryDetails salesItem = mapper.Map<InventoryDetails>(newItem);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            salesItem.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                salesItem.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                salesItem.InsertedByUserId = userId;
            }

            Unit_Of_Work.inventoryDetails_Repository.Add(salesItem);
            await Unit_Of_Work.SaveChangesAsync();
                
            }
            return Ok();
        }

        ////

        [HttpPut]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" },
        allowEdit: 1,
         pages: new[] { "Inventory" }
    )]
        public async Task<IActionResult> EditAsync([FromBody] List<InventoryDetailsPutDTO> newSales)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID, Type claim not found.");
            }

            foreach (var newSale in newSales)
            {
                if (newSale == null)
                {
                    return BadRequest("Sales Item cannot be null");
                }
                
                InventoryDetails salesItem = Unit_Of_Work.inventoryDetails_Repository.First_Or_Default(s => s.ID == newSale.ID && s.IsDeleted != true);
                if (salesItem == null)
                {
                    return NotFound("No SaleItem with this ID");
                }

                ShopItem shopItem = Unit_Of_Work.shopItem_Repository.First_Or_Default(s => s.ID == newSale.ShopItemID && s.IsDeleted != true);
                if (shopItem == null)
                {
                    return NotFound();
                }

                InventoryMaster sale = Unit_Of_Work.inventoryMaster_Repository.First_Or_Default(s => s.ID == newSale.InventoryMasterId && s.IsDeleted != true);
                if (sale == null)
                {
                    return NotFound();
                }
             
                if (userTypeClaim == "employee")
                {
                    IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Inventory", roleId, userId, salesItem);
                    if (accessCheck != null)
                    {
                        return accessCheck;
                    }
                }

                mapper.Map(newSale, salesItem);
                TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                salesItem.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    salesItem.UpdatedByOctaId = userId;
                    if (salesItem.UpdatedByUserId != null)
                    {
                        salesItem.UpdatedByUserId = null;
                    }
                }
                else if (userTypeClaim == "employee")
                {
                    salesItem.UpdatedByUserId = userId;
                    if (salesItem.UpdatedByOctaId != null)
                    {
                        salesItem.UpdatedByOctaId = null;
                    }
                }

                Unit_Of_Work.inventoryDetails_Repository.Update(salesItem);
                Unit_Of_Work.SaveChanges();
            }
            return Ok(newSales);
        }

        ////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" },
         allowDelete: 1,
         pages: new[] { "Inventory" }
     )]
        public IActionResult Delete(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (id == 0)
            {
                return BadRequest("Enter Sales Item ID");
            }

            InventoryDetails salesItem = Unit_Of_Work.inventoryDetails_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (salesItem == null)
            {
                return NotFound("No SaleItem with this ID");
            }


            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Inventory", roleId, userId, salesItem);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            salesItem.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            salesItem.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                salesItem.DeletedByOctaId = userId;
                if (salesItem.DeletedByUserId != null)
                {
                    salesItem.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                salesItem.DeletedByUserId = userId;
                if (salesItem.DeletedByOctaId != null)
                {
                    salesItem.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.inventoryDetails_Repository.Update(salesItem);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }


    }
}
