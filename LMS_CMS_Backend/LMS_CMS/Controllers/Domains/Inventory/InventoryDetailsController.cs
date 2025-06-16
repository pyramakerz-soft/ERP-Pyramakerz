using AutoMapper;
using LMS_CMS_BL.DTO.Inventory;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.Inventory;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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

        ////
        /////////////
        [HttpGet("inventory-total")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Inventory" })]
        public async Task<IActionResult> GetInventoryTotalAsync(
            long storeId,
            long shopItemId,
            DateTime endDate)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var excludedFlagNames = new List<string> { "offer price", "purchase order" };

            var inventoryDetails = await Unit_Of_Work.inventoryDetails_Repository
             .Select_All_With_IncludesById<InventoryDetails>(
                 x =>
                     x.ShopItemID == shopItemId &&
                     x.InventoryMaster.EtaInsertedDate <= endDate &&
                     x.InventoryMaster.IsDeleted == null &&
                     (
                         (x.InventoryMaster.StoreID == storeId &&
                          !excludedFlagNames.Contains(x.InventoryMaster.InventoryFlags.arName)) ||
                         (x.InventoryMaster.FlagId == 8 &&
                          x.InventoryMaster.StoreToTransformId == storeId)
                     ),
                 q => q.Include(x => x.InventoryMaster)
                       .ThenInclude(im => im.InventoryFlags),
                 q => q.Include(x => x.InventoryMaster)
                       .ThenInclude(im => im.Store),
                 q => q.Include(x => x.ShopItem)
             );

            int total = inventoryDetails.Sum(x =>
                x.Quantity * (x.InventoryMaster.InventoryFlags.ItemInOut == 1 ? 1 : -1));

            var first = inventoryDetails.FirstOrDefault();

            var dto = new InventoryTotalDTO
            {
                ShopItemId = shopItemId,
                StoreId = storeId,
                EndDate = endDate,
                TotalQuantity = total,
                ItemName = first?.ShopItem?.EnName ?? "N/A",
                StoreName = first?.InventoryMaster?.Store?.Name ?? "N/A",
                FlagName = first?.InventoryMaster?.InventoryFlags?.arName ?? "N/A"
            };

            return Ok(dto);
        }
        /// // /// // /// 
        //[HttpGet("report-inventory-master")]
        //[Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Inventory" })]
        //public async Task<IActionResult> GetInventoryMasterReportAsync(
        //     long? storeId,
        //     long? supplierId,
        //     DateTime fromDate,
        //     DateTime toDate)
        //{
        //    UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

        //    var inventoryMasters = await Unit_Of_Work.inventoryDetails_Repository
        //    .Select_All_With_Includes(
        //          x => x.InventoryFlags,
        //            x => x.Student,
        //            x => x.Supplier,
        //            x => x.Store);

        //    //  .ConfigureAwait(false);

        //    // Apply filters after fetch, or refactor includes method to take predicate if needed
        //    inventoryMasters = inventoryMasters
        //        .Where(x =>
        //            x.EtaInsertedDate >= fromDate &&
        //            x.EtaInsertedDate <= toDate &&
        //            x.IsDeleted == null &&
        //            (storeId == null || x.StoreID == storeId) &&
        //            (supplierId == null || x.SupplierId == supplierId))
        //        .ToList();

        //    var result = inventoryMasters.Select(x => new InventoryMasterReportDTO
        //    {
        //        FlagName = x.InventoryFlags?.arName ?? "N/A",
        //        InvoiceNumber = x.InvoiceNumber,
        //        DayDate = x.EtaInsertedDate,
        //        Notes = x.Notes,
        //        StoreName = x.Store?.Name ?? "N/A",
        //        StudentName = x.Student?.Name ?? "N/A",
        //        SupplierName = x.Supplier?.Name ?? "N/A"
        //    }).ToList();

        //    return Ok(result);
        //}

        /// 

        [HttpGet("BySaleId/{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Inventory" }
      )]
        public async Task<IActionResult> GetBySaleIDAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<InventoryDetails> salesItems = await Unit_Of_Work.inventoryDetails_Repository.Select_All_With_IncludesById<InventoryDetails>(
                    f => f.IsDeleted != true&&f.InventoryMasterId==id,
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

        ////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" },
        pages: new[] { "Inventory" }
        )]
        public async Task<IActionResult> GetByIDAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            InventoryDetails salesItems = await Unit_Of_Work.inventoryDetails_Repository.FindByIncludesAsync(
                    f => f.IsDeleted != true && f.ID == id,
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
        public async Task<IActionResult> EditAsync([FromBody] List<InventoryDetailsGetDTO> newSales)
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
