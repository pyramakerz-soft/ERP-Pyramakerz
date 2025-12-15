using AutoMapper;
using LMS_CMS_BL.DTO.Inventory;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.Inventory;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.Zatca;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace LMS_CMS_PL.Controllers.Domains.Inventory
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    public class StockingController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        public InVoiceNumberCreate _InVoiceNumberCreate;
        private readonly CheckPageAccessService _checkPageAccessService;


        public StockingController(DbContextFactoryService dbContextFactory, IMapper mapper, InVoiceNumberCreate inVoiceNumberCreate, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            this._InVoiceNumberCreate = inVoiceNumberCreate;
            _checkPageAccessService = checkPageAccessService;
        }



        [HttpGet()]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Inventory" }
        )]
        public async Task<IActionResult> GetAsync( [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            // Get total record count
            int totalRecords = await Unit_Of_Work.stocking_Repository
                .CountAsync(f => f.IsDeleted != true);

            List<Stocking> Data = await Unit_Of_Work.stocking_Repository.Select_All_With_IncludesById_Pagination<Stocking>(
                    f => f.IsDeleted != true,
                    query => query.Include(store => store.Store))
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (Data == null || Data.Count == 0)
            {
                return NotFound();
            }

            List<StockingGetDto> DTO = mapper.Map<List<StockingGetDto>>(Data);

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = DTO, Pagination = paginationMetadata });
        }


        /////////////////////////////////////////////////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Inventory" }
    )]
        public async Task<IActionResult> GetById(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (id == 0)
            {
                return BadRequest("Enter Master ID");
            }

            Stocking Data = await Unit_Of_Work.stocking_Repository.FindByIncludesAsync(
                    s => s.IsDeleted != true && s.ID == id,
                    query => query.Include(store => store.Store)
                    );

            if (Data == null)
            {
                return NotFound();
            }

            StockingGetDto DTO = mapper.Map<StockingGetDto>(Data);

            List<StockingDetails> stockingDetails = await Unit_Of_Work.stockingDetails_Repository.Select_All_With_IncludesById<StockingDetails>(
                    f => f.IsDeleted != true && f.StockingId == id,
                    query => query.Include(s => s.ShopItem),
                    query => query.Include(s => s.Stocking)
                    );

            if (stockingDetails == null || stockingDetails.Count == 0)
            {
                DTO.StockingDetails = new List<StockingDetailsGetDto>();
            }

            DTO.StockingDetails = mapper.Map<List<StockingDetailsGetDto>>(stockingDetails);

            return Ok(DTO);
        }
        /////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Inventory" }
      )]
        public async Task<IActionResult> Add(StockingAddDTO newData)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (newData == null)
            {
                return BadRequest("Master cannot be null.");
            }

            //if (newData.StockingDetails.Count == 0)
            //{
            //    return BadRequest("StockingDetails IsRequired");
            //}

            /// Create
            Stocking Master = mapper.Map<Stocking>(newData);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            Master.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                Master.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                Master.InsertedByUserId = userId;
            }

            Unit_Of_Work.stocking_Repository.Add(Master);
            await Unit_Of_Work.SaveChangesAsync();

            return Ok(Master.ID);
        }


        /////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
             pages: new[] { "Inventory" }
        )]
        public async Task<IActionResult> EditAsync(StockingEditDto newData)
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

            Stocking data = Unit_Of_Work.stocking_Repository.First_Or_Default(s => s.ID == newData.ID && s.IsDeleted != true);
            if (data == null || data.IsDeleted == true)
            {
                return NotFound("There Is No Stocking With This Id");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Inventory", roleId, userId, data);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }
            Store store = Unit_Of_Work.store_Repository.First_Or_Default(b => b.ID == newData.StoreID && b.IsDeleted != true);
            if (store == null)
            {
                return NotFound("Store cannot be null");
            }
            School school = new School();
            if (newData.SchoolId != 0 && newData.SchoolId != null)
            {
                school = Unit_Of_Work.school_Repository.First_Or_Default(b => b.ID == newData.SchoolId && b.IsDeleted != true);
                if (school == null)
                {
                    return NotFound("school not found.");
                }
            }
            else
            {
                newData.SchoolId = null;
            }
            if (newData.SchoolPCId != 0 && newData.SchoolPCId != null)
            {
                SchoolPCs SchoolPCId = Unit_Of_Work.schoolPCs_Repository.First_Or_Default(b => b.ID == newData.SchoolPCId && b.SchoolId == newData.SchoolId && b.IsDeleted != true);
                if (SchoolPCId == null)
                {
                    return NotFound("SchoolPCId not found.");
                }
            }
            else
            {
                newData.SchoolPCId = null;
            }
            mapper.Map(newData, data);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            data.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                data.UpdatedByOctaId = userId;
                if (data.UpdatedByUserId != null)
                {
                    data.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                data.UpdatedByUserId = userId;
                if (data.UpdatedByOctaId != null)
                {
                    data.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.stocking_Repository.Update(data);
            Unit_Of_Work.SaveChanges();

            // edit Details
            if(newData.UpdatedStockingDetails != null && newData.UpdatedStockingDetails.Count > 0) {
              foreach (var newItem in newData.UpdatedStockingDetails)
              {
                StockingDetails stockingDetails = Unit_Of_Work.stockingDetails_Repository.First_Or_Default(s => s.ID == newItem.ID && s.IsDeleted != true);
                if (stockingDetails != null)
                {
                    ShopItem shopItem = Unit_Of_Work.shopItem_Repository.First_Or_Default(s => s.ID == newItem.ShopItemID && s.IsDeleted != true);
                    if (shopItem == null)
                    {
                        return NotFound();
                    }

                    Stocking stocking = Unit_Of_Work.stocking_Repository.First_Or_Default(s => s.ID == newItem.StockingId && s.IsDeleted != true);
                    if (stocking == null)
                    {
                        return NotFound();
                    }

                    if (userTypeClaim == "employee")
                    {
                        IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Inventory", roleId, userId, stockingDetails);
                        if (accessCheck != null)
                        {
                            return accessCheck;
                        }
                    }

                    mapper.Map(newItem, stockingDetails);
                    stockingDetails.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        stockingDetails.UpdatedByOctaId = userId;
                        if (stockingDetails.UpdatedByUserId != null)
                        {
                            stockingDetails.UpdatedByUserId = null;
                        }
                    }
                    else if (userTypeClaim == "employee")
                    {
                        stockingDetails.UpdatedByUserId = userId;
                        if (stockingDetails.UpdatedByOctaId != null)
                        {
                            stockingDetails.UpdatedByOctaId = null;
                        }
                    }

                    Unit_Of_Work.stockingDetails_Repository.Update(stockingDetails);
                }

              }
              await Unit_Of_Work.SaveChangesAsync();
            }
            // new Details 
            if (newData.NewDetailsWhenEdit != null && newData.NewDetailsWhenEdit.Count > 0)
            {
                foreach (var newItem in newData.NewDetailsWhenEdit)
                {
                    if (newItem == null)
                    {
                        return BadRequest("Stocking Details cannot be null");
                    }
                    newItem.ID = null; 
                    ShopItem shopItem = Unit_Of_Work.shopItem_Repository.First_Or_Default(s => s.ID == newItem.ShopItemID && s.IsDeleted != true);
                    if (shopItem == null)
                    {
                        return NotFound();
                    }

                    Stocking stocking = Unit_Of_Work.stocking_Repository.First_Or_Default(s => s.ID == newItem.StockingId && s.IsDeleted != true);
                    if (stocking == null)
                    {
                        return NotFound();
                    }

                    StockingDetails stockingDetails = mapper.Map<StockingDetails>(newItem);

                    stockingDetails.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        stockingDetails.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        stockingDetails.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.stockingDetails_Repository.Add(stockingDetails);
                }
                await Unit_Of_Work.SaveChangesAsync();
            }

            // delete Details 
            if(newData.DeletedStockingDetails != null && newData.DeletedStockingDetails.Count > 0)
            {
                foreach (var item in newData.DeletedStockingDetails)
                {
                    StockingDetails stockingDetails = Unit_Of_Work.stockingDetails_Repository.First_Or_Default(s => s.ID == item && s.IsDeleted != true);
                    if (stockingDetails == null)
                    {
                        return NotFound("No Stocking Details with this ID");
                    }


                    if (userTypeClaim == "employee")
                    {
                        IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Inventory", roleId, userId, stockingDetails);
                        if (accessCheck != null)
                        {
                            return accessCheck;
                        }
                    }

                    stockingDetails.IsDeleted = true;
                    stockingDetails.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        stockingDetails.DeletedByOctaId = userId;
                        if (stockingDetails.DeletedByUserId != null)
                        {
                            stockingDetails.DeletedByUserId = null;
                        }
                    }
                    else if (userTypeClaim == "employee")
                    {
                        stockingDetails.DeletedByUserId = userId;
                        if (stockingDetails.DeletedByOctaId != null)
                        {
                            stockingDetails.DeletedByOctaId = null;
                        }
                    }

                    Unit_Of_Work.stockingDetails_Repository.Update(stockingDetails);
                    Unit_Of_Work.SaveChanges();
                }
            }
            return Ok(newData);
        }

        /////////////////////////////////////////////////////////////////////////////

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
                return BadRequest("Enter Store ID");
            }

            Stocking data = Unit_Of_Work.stocking_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);

            if (data == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Inventory", roleId, userId, data);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            data.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            data.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                data.DeletedByOctaId = userId;
                if (data.DeletedByUserId != null)
                {
                    data.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                data.DeletedByUserId = userId;
                if (data.DeletedByOctaId != null)
                {
                    data.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.stocking_Repository.Update(data);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
