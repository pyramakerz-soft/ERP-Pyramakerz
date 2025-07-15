using AutoMapper;
using LMS_CMS_BL.DTO.Inventory;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.Inventory;
using LMS_CMS_PL.Attribute;
using System.Linq;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using System;


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
            // الكود يربط الطلب الحالي بقاعدة البيانات المناسبة من خلال UOW.
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

        /// ///////////////////////////////////////////////////-777
        [HttpGet("inventory-net-summary")]
        [Authorize_Endpoint_(
      allowedTypes: new[] { "octa", "employee" },
      pages: new[] { "Inventory" })]
        public async Task<IActionResult> GetInventoryNetSummaryAsync(long storeId, long shopItemId, DateTime toDate)
        {
            var summaryDate = toDate.Date.AddDays(-1).AddTicks(9999999); // آخر لحظة من البارحة
            var Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var flagsToExclude = new long[] { 13 };

            // ✅ جلب البيانات
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
                    d.InventoryMaster.Date <= summaryDate &&
                    !flagsToExclude.Contains(d.InventoryMaster.FlagId) &&
                    d.InventoryMaster.InventoryFlags != null &&
                    d.InventoryMaster.InventoryFlags.ItemInOut != 0)
                .ToList();

            // ✅ حساب الكميات
            var inQuantity = filteredData
                .Where(d => d.InventoryMaster.InventoryFlags.ItemInOut == 1)
                .Sum(d => d.Quantity);

            var outQuantity = filteredData
                .Where(d => d.InventoryMaster.InventoryFlags.ItemInOut == -1)
                .Sum(d => d.Quantity);

            var quantityBalance = inQuantity - outQuantity;

            // ✅ حساب التكلفة
            var inCost = filteredData
                .Where(d => d.InventoryMaster.InventoryFlags.ItemInOut == 1)
                .Sum(d => d.Quantity * (d.AverageCost ?? 0));

            var outCost = filteredData
                .Where(d => d.InventoryMaster.InventoryFlags.ItemInOut == -1)
                .Sum(d => d.Quantity * (d.AverageCost ?? 0));

            var costBalance = inCost - outCost;

            // ✅ حفظ CostBalance و QuantityBalance في قاعدة البيانات
            foreach (var detail in filteredData)
            {
                detail.QuantityBalance = quantityBalance;
                detail.CostBalance = costBalance;
                Unit_Of_Work.inventoryDetails_Repository.Update(detail);
            }

            await Unit_Of_Work.SaveChangesAsync(); // حفظ التعديلات

            // ✅ إعداد النتيجة النهائية
            var dto = new InventoryNetSummaryDTO
            {
                ShopItemId = shopItemId,
                StoreId = storeId,
                ToDate = summaryDate,
                InQuantity = inQuantity,
                outQuantity = outQuantity,
                Quantitybalance = quantityBalance,
                CostBalance = costBalance
            };

            return Ok(dto);
        }


        // /////////////////////////////////////////////////////////////////////-77

        [HttpGet("inventory-net-transactions")]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" },
        pages: new[] { "Inventory" })]
        public async Task<IActionResult> GetInventoryNetTransactionsAsync(long storeId, long shopItemId, DateTime fromDate, DateTime toDate)
        {
            var parsedFromDate = fromDate.Date;
            var parsedToDate = toDate.Date.AddDays(1).AddTicks(-1);

            if (parsedFromDate > parsedToDate)
                return BadRequest("The start date cannot be after the end date.");

            var Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var flagsToExclude = new long[] { 13 };

            // ===== جلب البيانات مع Include =====
            var allData = await Unit_Of_Work.inventoryDetails_Repository
                .Select_All_With_IncludesById<InventoryDetails>(
                    d => d.InventoryMaster != null &&
                         d.InventoryMaster.IsDeleted != true &&
                         d.IsDeleted != true &&
                         d.ShopItemID == shopItemId &&
                         (
                            d.InventoryMaster.StoreID == storeId ||
                            (d.InventoryMaster.FlagId == 8 && d.InventoryMaster.StoreToTransformId == storeId)
                         ),
                    q => q.Include(d => d.InventoryMaster).ThenInclude(m => m.InventoryFlags),
                    q => q.Include(d => d.InventoryMaster.Supplier),
                    q => q.Include(d => d.InventoryMaster.Student),
                    q => q.Include(d => d.InventoryMaster.Store),
                    q => q.Include(d => d.InventoryMaster.StoreToTransform)
                );

            // ===== 1. حساب الرصيد السابق (قبل fromDate) =====
            var previousBalance = allData
                .Where(d =>
                    d.InventoryMaster.Date < parsedFromDate &&
                    !flagsToExclude.Contains(d.InventoryMaster.FlagId) &&
                    d.InventoryMaster.InventoryFlags.ItemInOut != 0)
                .Sum(d => d.Quantity * d.InventoryMaster.InventoryFlags.ItemInOut);

            // ===== 2. جلب الحركات من fromDate إلى toDate =====
            var transactionData = allData
                .Where(d =>
                    d.InventoryMaster.Date >= parsedFromDate &&
                    d.InventoryMaster.Date <= parsedToDate)
                .OrderBy(d => d.InventoryMaster.Date)
                .ToList();

            // ===== 3. بناء DTO مع تحديث الرصيد المتغير =====
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
                    FlagName = d.InventoryMaster.InventoryFlags.arName,
                    InvoiceNumber = d.InventoryMaster.InvoiceNumber,
                    Notes = d.InventoryMaster.Notes,
                    Quantity = d.Quantity,
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

            return Ok(transactions);
        }

        /////// /////////////////////////////////////////////////////////////////////////////////////-777

        //[HttpGet("AverageCost")]
        //[Authorize_Endpoint_(
        //     allowedTypes: new[] { "octa", "employee" },
        //     pages: new[] { "Inventory" }
        // )]
        //public async Task<IActionResult> CalculateAverageCostAsync(DateTime fromDate, DateTime toDate)
        //{
        //    var parsedFromDate = fromDate.Date;
        //    var parsedToDate = toDate.Date.AddDays(1).AddTicks(-1); // نهاية اليوم

        //    if (parsedFromDate > parsedToDate)
        //        return BadRequest("The start date cannot be after the end date.");

        //    var Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

        //    // ========== المرحلة 1: تصفير AverageCost ==========
        //    var resetData = await Unit_Of_Work.inventoryMaster_Repository
        //        .Select_All_With_IncludesById<InventoryMaster>(
        //            im => im.IsDeleted != true &&
        //                  im.Date >= parsedFromDate && im.Date <= parsedToDate,
        //            query => query.Include(im => im.InventoryDetails)
        //                          .Include(im => im.InventoryFlags)
        //        );

        //    foreach (var item in resetData.SelectMany(im => im.InventoryDetails))
        //    {
        //        item.AverageCost = 0;
        //        Unit_Of_Work.inventoryDetails_Repository.Update(item);
        //    }

        //    // ========== المرحلة 2: الحركات من نوع Opening & Purchase ==========
        //    var purchaseData = await Unit_Of_Work.inventoryMaster_Repository
        //        .Select_All_With_IncludesById<InventoryMaster>(
        //            im => im.IsDeleted != true &&
        //                  (im.FlagId == 1 || im.FlagId == 9) &&
        //                  im.Date >= parsedFromDate && im.Date <= parsedToDate,
        //            query => query.Include(im => im.InventoryDetails)
        //        );

        //    foreach (var item in purchaseData.SelectMany(im => im.InventoryDetails))
        //    {
        //        item.AverageCost = item.TotalPrice;
        //        Unit_Of_Work.inventoryDetails_Repository.Update(item);
        //    }

        //    // ========== المرحلة 3: الحركات اليومية (غير 1 و 9) ==========
        //    var currentDate = parsedFromDate;

        //    while (currentDate <= parsedToDate.Date)
        //    {
        //        var dailyData = await Unit_Of_Work.inventoryMaster_Repository
        //            .Select_All_With_IncludesById<InventoryMaster>(
        //                im => im.IsDeleted != true &&
        //                      im.FlagId != 1 && im.FlagId != 9 &&
        //                      im.Date.Date == currentDate.Date,
        //                query => query.Include(im => im.InventoryDetails)
        //            );

        //        foreach (var item in dailyData.SelectMany(im => im.InventoryDetails))
        //        {
        //            decimal? averageCost = await CalculateAverageCostForItem(item.ShopItemID, currentDate);
        //            item.AverageCost = (averageCost * item.Quantity) ?? 0;
        //            Unit_Of_Work.inventoryDetails_Repository.Update(item);
        //        }

        //        currentDate = currentDate.AddDays(1);
        //    }

        //    // ✅ حفظ كل التعديلات دفعة واحدة
        //    await Unit_Of_Work.SaveChangesAsync();

        //    // ========== المرحلة 4: تجهيز النتيجة ==========
        //    var resultData = await Unit_Of_Work.inventoryMaster_Repository
        //        .Select_All_With_IncludesById<InventoryMaster>(
        //            im => im.IsDeleted != true &&
        //                  im.Date >= parsedFromDate && im.Date <= parsedToDate,
        //            query => query.Include(im => im.InventoryDetails)
        //                          .Include(im => im.InventoryFlags)
        //        );

        //    var resultItems = resultData
        //        .SelectMany(im => im.InventoryDetails)
        //        .Select(id => new
        //        {
        //            AverageCost = id.AverageCost,
        //            Date = id.InventoryMaster.Date,
        //            ShopItemID = id.ShopItemID,
        //            Quantity = id.Quantity,
        //            Price = id.Price,
        //            TotalPrice = id.TotalPrice,
        //            FlagId = id.InventoryMaster.FlagId,
        //            enName = id.InventoryMaster.InventoryFlags.enName,
        //            ItemInOut = id.InventoryMaster.InventoryFlags.ItemInOut
        //        })
        //        .ToList();

        //    if (!resultItems.Any())
        //        return NotFound("No stock details found after processing");

        //    return Ok(resultItems);
        //}
        // /////////////////////////////////////////////////////////////-77
        [HttpGet("AverageCost")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Inventory" }
        )]
        public async Task<IActionResult> CalculateAverageCostAsync(DateTime fromDate, DateTime toDate)
        {
            var parsedFromDate = fromDate.Date;
            var parsedToDate = toDate.Date.AddDays(1).AddTicks(-1); // نهاية اليوم

            if (parsedFromDate > parsedToDate)
                return BadRequest("The start date cannot be after the end date.");

            var Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            // ✅ تحميل جميع الحركات مرة واحدة
            var allInventoryData = await Unit_Of_Work.inventoryMaster_Repository
                .Select_All_With_IncludesById<InventoryMaster>(
                    im => im.IsDeleted != true &&
                          im.Date >= parsedFromDate && im.Date <= parsedToDate,
                    query => query
                        .Include(im => im.InventoryDetails)
                        .Include(im => im.InventoryFlags)
                );

            // ========== المرحلة 1: تصفير AverageCost ==========
            foreach (var item in allInventoryData.SelectMany(im => im.InventoryDetails))
            {
                item.AverageCost = 0;
                Unit_Of_Work.inventoryDetails_Repository.Update(item);
            }

            // ========== المرحلة 2: Opening Balance & Purchases ==========
            foreach (var item in allInventoryData
                        .Where(im => im.FlagId == 1 || im.FlagId == 9)
                        .SelectMany(im => im.InventoryDetails))
            {
                item.AverageCost = item.TotalPrice;
                Unit_Of_Work.inventoryDetails_Repository.Update(item);
            }

            // ========== المرحلة 3: الحركات اليومية ==========
            var currentDate = parsedFromDate;
            while (currentDate <= parsedToDate.Date)
            {
                var dailyItems = allInventoryData
                    .Where(im => im.FlagId != 1 && im.FlagId != 9 && im.Date.Date == currentDate.Date)
                    .SelectMany(im => im.InventoryDetails);

                foreach (var item in dailyItems)
                {
                    decimal? averageCost = await CalculateAverageCostForItem(item.ShopItemID, currentDate);
                    item.AverageCost = (averageCost * item.Quantity) ?? 0;
                    Unit_Of_Work.inventoryDetails_Repository.Update(item);
                }

                currentDate = currentDate.AddDays(1);
            }

            // ✅ حفظ كل التعديلات دفعة واحدة
            await Unit_Of_Work.SaveChangesAsync();

            // ========== المرحلة 4: إعداد النتيجة النهائية ==========
            var resultItems = allInventoryData
                .SelectMany(im => im.InventoryDetails)
                .Select(id => new
                {
                    AverageCost = id.AverageCost,
                    Date = id.InventoryMaster.Date,
                    ShopItemID = id.ShopItemID,
                    Quantity = id.Quantity,
                    Price = id.Price,
                    TotalPrice = id.TotalPrice,
                    FlagId = id.InventoryMaster.FlagId,
                    enName = id.InventoryMaster.InventoryFlags.enName,
                    ItemInOut = id.InventoryMaster.InventoryFlags.ItemInOut
                })
                .ToList();

            if (!resultItems.Any())
                return NotFound("No stock details found after processing");

            return Ok(resultItems);
        }

        // /////////////////////////////////////////////////////////////-7
        private async Task<decimal> CalculateAverageCostForItem(long shopItemId, DateTime targetDate)
        {
            var Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            // جلب الحركات المرتبطة بالصنف قبل التاريخ المستهدف (مع الفلاتر)
            var dbItems = await Unit_Of_Work.inventoryDetails_Repository
                .Query()
                .Include(id => id.InventoryMaster)
                    .ThenInclude(im => im.InventoryFlags)
                .Where(id =>
                    id.InventoryMaster.IsDeleted != true &&
                    id.ShopItemID == shopItemId &&
                    id.InventoryMaster.InventoryFlags.ItemInOut != 0 &&
                    (
                        id.InventoryMaster.Date.Date < targetDate.Date || // قبل اليوم المطلوب
                        (id.InventoryMaster.Date.Date == targetDate.Date && // أو في نفس اليوم مع كود 1 أو 9
                         (id.InventoryMaster.FlagId == 1 || id.InventoryMaster.FlagId == 9))
                    ))
                .ToListAsync();

            if (!dbItems.Any())
                return 0;

            // حساب المتوسط المرجح (Moving Average)
            decimal totalWeightedCost = dbItems.Sum(id =>
                id.InventoryMaster.InventoryFlags.ItemInOut * (id.AverageCost ?? 0));

            decimal totalQuantity = dbItems.Sum(id =>
                id.InventoryMaster.InventoryFlags.ItemInOut * id.Quantity);

            if (totalQuantity == 0)
                return 0;

            return totalWeightedCost / totalQuantity;
        }
        ///// /////////////////////////////////////////////////////////////////////////////////////-777
        [HttpGet("BySaleId/{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Inventory" }
      )]
        public async Task<IActionResult> GetBySaleIDAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<InventoryDetails> salesItems = await Unit_Of_Work.inventoryDetails_Repository.Select_All_With_IncludesById<InventoryDetails>(
                    f => f.IsDeleted != true&&
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

        /// //////////////////////////////////////////////////////////////////////////

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
