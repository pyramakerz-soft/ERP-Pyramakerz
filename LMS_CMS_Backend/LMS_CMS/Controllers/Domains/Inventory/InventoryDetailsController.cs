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
using Microsoft.EntityFrameworkCore.Query;


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
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Inventory" })]
        public async Task<IActionResult> GetInventoryNetSummaryAsync(long storeId, long shopItemId, string toDate )
        {
            if (!DateTime.TryParse(toDate, out DateTime toDateTime))
                return BadRequest("Invalid date format.");

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var flagsToExclude = new long[] { 13 };

            var data = await Unit_Of_Work.inventoryDetails_Repository
                .Select_All_With_IncludesById<InventoryDetails>(
                    d => d.InventoryMaster != null && d.InventoryMaster.IsDeleted != true,
                    q => q.Include(d => d.InventoryMaster).ThenInclude(im => im.InventoryFlags));


            var filteredData = data
                .Where(d =>
                    d.InventoryMaster != null &&
                    d.InventoryMaster.IsDeleted != true &&
                    d.ShopItemID == shopItemId &&
                    DateTime.TryParse(d.InventoryMaster.Date, out var docDate) &&
                    docDate.Date <= toDateTime.Date &&
                    !flagsToExclude.Contains(d.InventoryMaster.FlagId) &&
                    (
                        d.InventoryMaster.StoreID == storeId ||
                        (d.InventoryMaster.FlagId == 8 && d.InventoryMaster.StoreToTransformId == storeId)
                    ) &&
                    d.InventoryMaster.InventoryFlags.ItemInOut != 0
                )
                .ToList();

            var inQuantity = filteredData
                .Where(d => d.InventoryMaster.InventoryFlags.ItemInOut == 1)
                .Sum(d => d.Quantity);

            var outQuantity = filteredData
                .Where(d => d.InventoryMaster.InventoryFlags.ItemInOut == -1)
                .Sum(d => d.Quantity);

            var balance = inQuantity - outQuantity;

            var dto = new InventoryNetSummaryDTO
            {
                ShopItemId = shopItemId,
                StoreId = storeId,
                ToDate = toDateTime.AddDays(-1).ToString("yyyy-MM-dd"),
                InQuantity = inQuantity,
                outQuantity = outQuantity,
                Balance = balance
 
            };

            return Ok(dto);
        }



        /// /////////////////////////////////////////////////////////////////////////////////////-777

        [HttpGet("inventory-net-transactions")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Inventory" })]
        public async Task<IActionResult> GetInventoryNetTransactionsAsync(
        long storeId,
        long shopItemId,
        string fromDate,
        string toDate)
        {
            if (!DateTime.TryParse(fromDate, out DateTime fromDateTime) ||
                !DateTime.TryParse(toDate, out DateTime toDateTime))
            {
                return BadRequest("Invalid date format.");
            }

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var data = (await Unit_Of_Work.inventoryDetails_Repository
                .Select_All_With_IncludesById<InventoryDetails>(
                        d => d.IsDeleted != true &&
                         d.InventoryMaster != null &&
                          d.InventoryMaster.IsDeleted != true &&
                           d.ShopItemID == shopItemId &&
                            (d.InventoryMaster.StoreID == storeId ||
                             (d.InventoryMaster.FlagId == 8 && d.InventoryMaster.StoreToTransformId == storeId)),

                    q => q.Include(d => d.InventoryMaster).ThenInclude(m => m.InventoryFlags),
                    q => q.Include(d => d.InventoryMaster.Supplier),
                    q => q.Include(d => d.InventoryMaster.Student),
                    q => q.Include(d => d.InventoryMaster.StoreToTransform))).AsEnumerable()

                .Where(d =>
                    DateTime.TryParse(d.InventoryMaster.Date, out DateTime date) &&
                    date >= fromDateTime &&
                    date <= toDateTime)
                .Select(d =>
                {
                    double signedQty = d.Quantity * d.InventoryMaster.InventoryFlags.ItemInOut;
                    return new InventoryNetTransactionDTO
                    {
                        FlagName = d.InventoryMaster.InventoryFlags.arName,
                        InvoiceNumber = d.InventoryMaster.InvoiceNumber,
                        DayDate = d.InventoryMaster.Date,
                        Notes = d.InventoryMaster.Notes,
                        Quantity = d.Quantity,

                        SupplierName = (new long[] { 9, 10, 13 }.Contains(d.InventoryMaster.FlagId)) ? d.InventoryMaster.Supplier?.Name : null,

                        StudentName = (new long[] { 11, 12 }.Contains(d.InventoryMaster.FlagId)) ? d.InventoryMaster.Student?.en_name : null,

                        StoreToName = (d.InventoryMaster.FlagId == 8) ? d.InventoryMaster.StoreToTransform?.Name : null,

                        TotalIn = signedQty > 0 ? signedQty : 0,
                        TotalOut = signedQty < 0 ? Math.Abs(signedQty) : 0,
                        Balance = signedQty
                    };
                })
                .ToList();

            return Ok(data);
        }



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
