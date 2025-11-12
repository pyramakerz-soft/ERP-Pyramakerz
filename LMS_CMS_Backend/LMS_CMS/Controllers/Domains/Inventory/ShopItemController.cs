using AutoMapper;
using LMS_CMS_BL.DTO;
using LMS_CMS_BL.DTO.Inventory;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.DTO.Registration;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.Inventory;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using LMS_CMS_PL.Services.FileValidations;
using LMS_CMS_PL.Services.S3;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Inventory
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class ShopItemController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly FileImageValidationService _fileImageValidationService;
        private readonly GenerateBarCodeEan13 _generateBarCodeEan13;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileUploadsService _fileService;

        public ShopItemController(DbContextFactoryService dbContextFactory, IMapper mapper, FileImageValidationService fileImageValidationService, GenerateBarCodeEan13 generateBarCodeEan13, CheckPageAccessService checkPageAccessService, FileUploadsService fileService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _fileImageValidationService = fileImageValidationService;
            _generateBarCodeEan13 = generateBarCodeEan13;
            _checkPageAccessService = checkPageAccessService;
            _fileService = fileService;
        }

        ///////////////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Shop Item", "Shop" , "Items", "Stocking" , "Item Card Report" 
               , "Item Card Report With Average" }
        )]
        public async Task<IActionResult> GetAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<ShopItem> shopItem = await Unit_Of_Work.shopItem_Repository.Select_All_With_IncludesById<ShopItem>(
                    b => b.IsDeleted != true,
                    query => query.Include(sub => sub.InventorySubCategories),
                    query => query.Include(sub => sub.School),
                    query => query.Include(sub => sub.Grade),
                    query => query.Include(sub => sub.Gender),
                    query => query.Include(sub => sub.ShopItemColor),
                    query => query.Include(sub => sub.ShopItemSize)
                    );

            if (shopItem == null || shopItem.Count == 0)
            {
                return NotFound();
            }

            List<ShopItemGetDTO> shopItemGetDTO = mapper.Map<List<ShopItemGetDTO>>(shopItem);
            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var item in shopItemGetDTO)
            { 
                item.MainImage = _fileService.GetFileUrl(item.MainImage, Request, HttpContext);
                item.OtherImage = _fileService.GetFileUrl(item.OtherImage, Request, HttpContext);

                List<ShopItemColor> shopItemColors = await Unit_Of_Work.shopItemColor_Repository.Select_All_With_IncludesById<ShopItemColor>(s => s.ShopItemID == item.ID && s.IsDeleted != true);
                if (shopItemColors.Count != 0)
                {
                    List<ShopItemColorGetDTO> shopItemColorGetDTO = mapper.Map<List<ShopItemColorGetDTO>>(shopItemColors);
                    item.shopItemColors = shopItemColorGetDTO;
                }
                else
                    item.shopItemColors = new List<ShopItemColorGetDTO>();

                List<ShopItemSize> shopItemSizes = await Unit_Of_Work.shopItemSize_Repository.Select_All_With_IncludesById<ShopItemSize>(s => s.ShopItemID == item.ID && s.IsDeleted != true);
                if (shopItemSizes.Count != 0)
                {
                    List<ShopItemSizeGetDTO> shopItemSizeGetDTO = mapper.Map<List<ShopItemSizeGetDTO>>(shopItemSizes);
                    item.shopItemSizes = shopItemSizeGetDTO;
                }
                else
                    item.shopItemSizes = new List<ShopItemSizeGetDTO>();
            }

            return Ok(shopItemGetDTO);
        }

        ///////////////////////////////////////////

        [HttpGet("GetBySubCategoryID/{SubCategoryID}")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" , "parent" , "student" }
        )]
        public async Task<IActionResult> GetBySubCategoryID(long SubCategoryID, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchQuery = null)
        { 
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            int totalRecords = await Unit_Of_Work.shopItem_Repository
                .CountAsync(f => f.IsDeleted != true);
             
            var shopItemQuery = Unit_Of_Work.shopItem_Repository
                .Select_All_With_IncludesById_Pagination<ShopItem>(
                    b => b.IsDeleted != true && b.InventorySubCategoriesID == SubCategoryID && b.AvailableInShop == true,
                    query => query.Include(sub => sub.InventorySubCategories),
                    query => query.Include(sub => sub.School),
                    query => query.Include(sub => sub.Grade),
                    query => query.Include(sub => sub.Gender),
                    query => query.Include(sub => sub.ShopItemColor),
                    query => query.Include(sub => sub.ShopItemSize)
                );
             
            if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                string searchLower = searchQuery.ToLower();
                shopItemQuery = shopItemQuery.Where(s =>
                    s.EnName.ToLower().Contains(searchLower) || 
                    s.ArName.ToLower().Contains(searchLower) || 
                    s.EnDescription.ToLower().Contains(searchLower) ||
                    s.ArDescription.ToLower().Contains(searchLower) 
                );
            }

            totalRecords = await shopItemQuery.CountAsync();

            var shopItems = await shopItemQuery
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (shopItems == null || shopItems.Count == 0)
            {
                return NotFound();
            }

            List<ShopItemGetDTO> shopItemGetDTO = mapper.Map<List<ShopItemGetDTO>>(shopItems);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";

            //foreach (var item in shopItemGetDTO)
            //{
            //    item.MainImage = _fileService.GetFileUrl(item.MainImage, Request, HttpContext);
            //    item.OtherImage = _fileService.GetFileUrl(item.OtherImage, Request, HttpContext);

            //    List<ShopItemColor> shopItemColors = await Unit_Of_Work.shopItemColor_Repository.Select_All_With_IncludesById<ShopItemColor>(s => s.ShopItemID == item.ID && s.IsDeleted != true);
            //    if (shopItemColors.Count != 0)
            //    {
            //        List<ShopItemColorGetDTO> shopItemColorGetDTO = mapper.Map<List<ShopItemColorGetDTO>>(shopItemColors);
            //        item.shopItemColors = shopItemColorGetDTO;
            //    }
            //    else
            //        item.shopItemColors = new List<ShopItemColorGetDTO>();

            //    List<ShopItemSize> shopItemSizes = await Unit_Of_Work.shopItemSize_Repository.Select_All_With_IncludesById<ShopItemSize>(s => s.ShopItemID == item.ID && s.IsDeleted != true);
            //    if (shopItemSizes.Count != 0)
            //    {   
            //        List<ShopItemSizeGetDTO> shopItemSizeGetDTO = mapper.Map<List<ShopItemSizeGetDTO>>(shopItemSizes);
            //        item.shopItemSizes = shopItemSizeGetDTO;
            //    }
            //    else
            //        item.shopItemSizes = new List<ShopItemSizeGetDTO>();
            //}

            var itemIds = shopItems.Select(s => s.ID).ToList();

            var allColors = Unit_Of_Work.shopItemColor_Repository
                .FindBy(s => itemIds.Contains(s.ShopItemID) && s.IsDeleted != true);

            var allSizes = Unit_Of_Work.shopItemSize_Repository
                .FindBy(s => itemIds.Contains(s.ShopItemID) && s.IsDeleted != true);

            foreach (var item in shopItemGetDTO)
            {
                item.MainImage = _fileService.GetFileUrl(item.MainImage, Request, HttpContext);
                item.OtherImage = _fileService.GetFileUrl(item.OtherImage, Request, HttpContext);

                var itemColors = allColors.Where(c => c.ShopItemID == item.ID).ToList();
                var itemSizes = allSizes.Where(sz => sz.ShopItemID == item.ID).ToList();

                item.shopItemColors = mapper.Map<List<ShopItemColorGetDTO>>(itemColors);
                item.shopItemSizes = mapper.Map<List<ShopItemSizeGetDTO>>(itemSizes);
            }

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = shopItemGetDTO, Pagination = paginationMetadata });
        }
        
        ///////////////////////////////////////////

        [HttpGet("GetBySubCategoryIDWithGenderAndGradeAndStudentID/{SubCategoryID}/{StudentID}")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee", "student" , "parent" }
        )]
        public async Task<IActionResult> GetBySubCategoryIDWithGenderAndGradeAndStudentID(long SubCategoryID, long StudentID, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchQuery = null)
        {
            long gradeID = 0;
            long genderID = 0;

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            int totalRecords = await Unit_Of_Work.shopItem_Repository
                .CountAsync(f => f.IsDeleted != true);
             
            var shopItemQuery = Unit_Of_Work.shopItem_Repository
                .Select_All_With_IncludesById_Pagination<ShopItem>(
                    b => b.IsDeleted != true && b.InventorySubCategoriesID == SubCategoryID && b.AvailableInShop == true,
                    query => query.Include(sub => sub.InventorySubCategories),
                    query => query.Include(sub => sub.School),
                    query => query.Include(sub => sub.Grade),
                    query => query.Include(sub => sub.Gender),
                    query => query.Include(sub => sub.ShopItemColor),
                    query => query.Include(sub => sub.ShopItemSize)
                );


            Student student = Unit_Of_Work.student_Repository.First_Or_Default(
                d => d.ID == StudentID && d.IsDeleted != true
                );

            if (student == null)
            {
                return NotFound("There is No Student with this ID");
            }

            genderID = student.GenderId;

            //StudentAcademicYear studentAcademicYear = Unit_Of_Work.studentAcademicYear_Repository.First_Or_Default(
            //    d => d.IsDeleted != true && d.StudentID == StudentID && d.Classroom.AcademicYear.IsActive == true
            //    );

            StudentGrade studentGrade = Unit_Of_Work.studentGrade_Repository.First_Or_Default( d => d.IsDeleted != true && d.StudentID == StudentID && d.AcademicYear.IsActive == true);

            if(studentGrade != null)
            {
                gradeID = studentGrade.GradeID;
            }

            if(gradeID == 0 || genderID == 0)
            {
                return NotFound("Student Isn't Assigned to Grade or Doesn't have Gender");
            }

            shopItemQuery = shopItemQuery.Where(s => s.GenderID == genderID || s.GenderID == null);
            shopItemQuery = shopItemQuery.Where(s => s.GradeID == gradeID || s.GradeID == null); 

            if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                string searchLower = searchQuery.ToLower();
                shopItemQuery = shopItemQuery.Where(s =>
                    s.EnName.ToLower().Contains(searchLower) || 
                    s.ArName.ToLower().Contains(searchLower) || 
                    s.EnDescription.ToLower().Contains(searchLower) ||
                    s.ArDescription.ToLower().Contains(searchLower) 
                );
            }

            totalRecords = await shopItemQuery.CountAsync();

            var shopItems = await shopItemQuery
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (shopItems == null || shopItems.Count == 0)
            {
                return NotFound();
            }

            List<ShopItemGetDTO> shopItemGetDTO = mapper.Map<List<ShopItemGetDTO>>(shopItems);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";

            foreach (var item in shopItemGetDTO)
            {
                item.MainImage = _fileService.GetFileUrl(item.MainImage, Request, HttpContext);
                item.OtherImage = _fileService.GetFileUrl(item.OtherImage, Request, HttpContext);

                List<ShopItemColor> shopItemColors = await Unit_Of_Work.shopItemColor_Repository.Select_All_With_IncludesById<ShopItemColor>(s => s.ShopItemID == item.ID && s.IsDeleted != true);
                if (shopItemColors.Count != 0)
                {
                    List<ShopItemColorGetDTO> shopItemColorGetDTO = mapper.Map<List<ShopItemColorGetDTO>>(shopItemColors);
                    item.shopItemColors = shopItemColorGetDTO;
                }
                else
                    item.shopItemColors = new List<ShopItemColorGetDTO>();

                List<ShopItemSize> shopItemSizes = await Unit_Of_Work.shopItemSize_Repository.Select_All_With_IncludesById<ShopItemSize>(s => s.ShopItemID == item.ID && s.IsDeleted != true);
                if (shopItemSizes.Count != 0)
                {
                    List<ShopItemSizeGetDTO> shopItemSizeGetDTO = mapper.Map<List<ShopItemSizeGetDTO>>(shopItemSizes);
                    item.shopItemSizes = shopItemSizeGetDTO;
                }
                else
                    item.shopItemSizes = new List<ShopItemSizeGetDTO>();
            }

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = shopItemGetDTO, Pagination = paginationMetadata });
        }

        //////////////////////////////////////////////////////////////////////////////

        [HttpGet("BySubCategoryId/{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Inventory", "Sales Returns", "Sales", "Purchase Returns", "Purchase Order", "Purchases", "Opening Balances", "Addition", "Damaged", "Transfer to Store", "Gifts", "Disbursement Adjustment", "Disbursement", "Addition Adjustment" }
         )]
        public async Task<IActionResult> GetBySubCategoryAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<ShopItem> shopItem = await Unit_Of_Work.shopItem_Repository.Select_All_With_IncludesById<ShopItem>(
                    b => b.IsDeleted != true && b.InventorySubCategoriesID == id,
                    query => query.Include(sub => sub.InventorySubCategories),
                    query => query.Include(sub => sub.School),
                    query => query.Include(sub => sub.Grade),
                    query => query.Include(sub => sub.Gender),
                    query => query.Include(sub => sub.ShopItemColor),
                    query => query.Include(sub => sub.ShopItemSize)
                    );

            if (shopItem == null || shopItem.Count == 0)
            {
                return NotFound();
            }

            List<ShopItemGetDTO> shopItemGetDTO = mapper.Map<List<ShopItemGetDTO>>(shopItem);
            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var item in shopItemGetDTO)
            {
                item.MainImage = _fileService.GetFileUrl(item.MainImage, Request, HttpContext);
                item.OtherImage = _fileService.GetFileUrl(item.OtherImage, Request, HttpContext);

                List<ShopItemColor> shopItemColors = await Unit_Of_Work.shopItemColor_Repository.Select_All_With_IncludesById<ShopItemColor>(s => s.ShopItemID == item.ID && s.IsDeleted != true);
                if (shopItemColors.Count != 0)
                {
                    List<ShopItemColorGetDTO> shopItemColorGetDTO = mapper.Map<List<ShopItemColorGetDTO>>(shopItemColors);
                    item.shopItemColors = shopItemColorGetDTO;
                }
                else
                    item.shopItemColors = new List<ShopItemColorGetDTO>();

                List<ShopItemSize> shopItemSizes = await Unit_Of_Work.shopItemSize_Repository.Select_All_With_IncludesById<ShopItemSize>(s => s.ShopItemID == item.ID && s.IsDeleted != true);
                if (shopItemSizes.Count != 0)
                {
                    List<ShopItemSizeGetDTO> shopItemSizeGetDTO = mapper.Map<List<ShopItemSizeGetDTO>>(shopItemSizes);
                    item.shopItemSizes = shopItemSizeGetDTO;
                }
                else
                    item.shopItemSizes = new List<ShopItemSizeGetDTO>();
            }

            return Ok(shopItemGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "student" , "parent"},
            pages: new[] { "Shop Item", "Shop" }
         )]
        public async Task<IActionResult> GetByIdAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            ShopItem shopItem = await Unit_Of_Work.shopItem_Repository.FindByIncludesAsync(
                d => d.ID == id && d.IsDeleted != true,
                query => query.Include(sub => sub.InventorySubCategories),
                query => query.Include(sub => sub.School),
                query => query.Include(sub => sub.Grade),
                query => query.Include(sub => sub.Gender),
                query => query.Include(sub => sub.ShopItemColor),
                query => query.Include(sub => sub.ShopItemSize)
                );

            if (shopItem == null)
            {
                return NotFound();
            }

            ShopItemGetDTO shopItemDTO = mapper.Map<ShopItemGetDTO>(shopItem);
            
            shopItemDTO.MainImage = _fileService.GetFileUrl(shopItemDTO.MainImage, Request, HttpContext);
            shopItemDTO.OtherImage = _fileService.GetFileUrl(shopItemDTO.OtherImage, Request, HttpContext);

            List<ShopItemColor> shopItemColors = Unit_Of_Work.shopItemColor_Repository.FindBy(s => s.ShopItemID == shopItemDTO.ID && s.IsDeleted != true);
            List<ShopItemColorGetDTO> shopItemColorGetDTO = mapper.Map<List<ShopItemColorGetDTO>>(shopItemColors);
            if (shopItemColorGetDTO != null)
                shopItemDTO.shopItemColors = shopItemColorGetDTO;
            else
                shopItemDTO.shopItemColors = new List<ShopItemColorGetDTO>();

            List<ShopItemSize> shopItemSizes = Unit_Of_Work.shopItemSize_Repository.FindBy(s => s.ShopItemID == shopItemDTO.ID && s.IsDeleted != true);
            List<ShopItemSizeGetDTO> shopItemSizeGetDTO = mapper.Map<List<ShopItemSizeGetDTO>>(shopItemSizes);
            if (shopItemSizeGetDTO != null)
                shopItemDTO.shopItemSizes = shopItemSizeGetDTO;
            else
                shopItemDTO.shopItemSizes = new List<ShopItemSizeGetDTO>();

            if(userTypeClaim == "student")
            {
                Student stu = Unit_Of_Work.student_Repository.First_Or_Default(s => s.IsDeleted != true && s.ID == userId);
                if(stu.Nationality == 148)
                {
                    shopItemDTO.VATForForeign = 0;
                }
            }

            return Ok(shopItemDTO);
        }

        //////////////////////////////////////////////////////////////////////////////

        [HttpGet("ByBarcode/{BarCode}/{StoreId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Shop Item", "Shop", "Sales Returns", "Sales", "Purchase Returns", "Purchase Order", "Purchases", "Opening Balances", "Addition", "Damaged", "Transfer to Store", "Gifts", "Disbursement Adjustment", "Disbursement", "Addition Adjustment" }
         )]
        public async Task<IActionResult> GetbyIdAsync(string BarCode,long StoreId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            

            ShopItem shopItem = await Unit_Of_Work.shopItem_Repository.FindByIncludesAsync(
                d => d.BarCode == BarCode && d.IsDeleted != true,
                query => query.Include(sub => sub.InventorySubCategories).ThenInclude(a=>a.InventoryCategories)
                );

            if (shopItem == null)
            {
                return NotFound();
            }

            StoreCategories storeCategories = Unit_Of_Work.storeCategories_Repository.First_Or_Default(s => s.StoreID == StoreId && s.InventoryCategoriesID == shopItem.InventorySubCategories.InventoryCategoriesID);
            if (storeCategories == null)
            {
                return NotFound();
            }

            ShopItemGetDTO shopItemDTO = mapper.Map<ShopItemGetDTO>(shopItem);
            shopItemDTO.MainImage = _fileService.GetFileUrl(shopItemDTO.MainImage, Request, HttpContext);
            shopItemDTO.OtherImage = _fileService.GetFileUrl(shopItemDTO.OtherImage, Request, HttpContext);

            List<ShopItemColor> shopItemColors = Unit_Of_Work.shopItemColor_Repository.FindBy(s => s.ShopItemID == shopItemDTO.ID && s.IsDeleted != true);
            List<ShopItemColorGetDTO> shopItemColorGetDTO = mapper.Map<List<ShopItemColorGetDTO>>(shopItemColors);
            if (shopItemColorGetDTO != null)
                shopItemDTO.shopItemColors = shopItemColorGetDTO;
            else
                shopItemDTO.shopItemColors = new List<ShopItemColorGetDTO>();

            List<ShopItemSize> shopItemSizes = Unit_Of_Work.shopItemSize_Repository.FindBy(s => s.ShopItemID == shopItemDTO.ID && s.IsDeleted != true);
            List<ShopItemSizeGetDTO> shopItemSizeGetDTO = mapper.Map<List<ShopItemSizeGetDTO>>(shopItemSizes);
            if (shopItemSizeGetDTO != null)
                shopItemDTO.shopItemSizes = shopItemSizeGetDTO;
            else
                shopItemDTO.shopItemSizes = new List<ShopItemSizeGetDTO>();

            return Ok(shopItemDTO);
        }

        //////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Shop Item", "Shop" }
        )]
        public async Task<IActionResult> Add([FromForm] ShopItemAddDTO newShopItem)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (newShopItem == null)
            {
                return BadRequest("Shop Item cannot be null");
            }

            InventorySubCategories invSubCat = Unit_Of_Work.inventorySubCategories_Repository.First_Or_Default(
                d => d.ID == newShopItem.InventorySubCategoriesID && d.IsDeleted != true
                );
            if (invSubCat == null)
            {
                return NotFound("No Inventory Sub Categories With this ID");
            }

            School school = Unit_Of_Work.school_Repository.First_Or_Default(
                d => d.ID == newShopItem.SchoolID && d.IsDeleted != true
                );
            if (school == null)
            {
                return NotFound("No School With this ID");
            }

            if (newShopItem.GradeID != 0 && newShopItem.GradeID != null)
            {
                Grade grade = Unit_Of_Work.grade_Repository.First_Or_Default(
                    d => d.ID == newShopItem.GradeID && d.IsDeleted != true
                    );
                if (grade == null)
                {
                    return NotFound("No Grade With this ID");
                }
            }
            else
            {
                newShopItem.GradeID = null;
            }

            if (newShopItem.GenderID != 0 && newShopItem.GenderID != null)
            {
                Gender gender = Unit_Of_Work.gender_Repository.First_Or_Default(
                d => d.ID == newShopItem.GenderID
                );
                if (gender == null)
                {
                    return NotFound("No Gender With this ID");
                }
            }
            else
            {
                newShopItem.GenderID = null;
            }

            if (newShopItem.BarCode != null)
            {
                ShopItem shopItem = Unit_Of_Work.shopItem_Repository.First_Or_Default(
                    d => d.BarCode == newShopItem.BarCode && d.IsDeleted != true
                    );

                if (shopItem != null)
                {
                    return BadRequest("BarCode Must Be unique");
                }
            }
            else
            {
                newShopItem.BarCode = "Test";
            }

            if (newShopItem.MainImageFile != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(newShopItem.MainImageFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }
            if (newShopItem.OtherImageFile != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(newShopItem.OtherImageFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            ShopItem ShopItem = mapper.Map<ShopItem>(newShopItem);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            ShopItem.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                ShopItem.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                ShopItem.InsertedByUserId = userId;
            }

            Unit_Of_Work.shopItem_Repository.Add(ShopItem);
            Unit_Of_Work.SaveChanges();

            if (newShopItem.MainImageFile != null)
            {
                ShopItem.MainImage = await _fileService.UploadFileAsync(newShopItem.MainImageFile, "Inventory/ShopItems/MainImage", ShopItem.ID, HttpContext); 
            }
            if (newShopItem.OtherImageFile != null)
            {
                ShopItem.OtherImage = await _fileService.UploadFileAsync(newShopItem.OtherImageFile, "Inventory/ShopItems/OtherImage", ShopItem.ID, HttpContext); 
            } 

            if (newShopItem.BarCode == "Test")
            {
                string barCode = _generateBarCodeEan13.GenerateEan13(ShopItem.ID.ToString());
                ShopItem shopItemexist = Unit_Of_Work.shopItem_Repository.First_Or_Default(
                    d => d.BarCode == barCode && d.IsDeleted != true
                    );

                if (shopItemexist != null)
                {
                    return BadRequest("BarCode Must Be unique");
                }
                else
                {
                    ShopItem.BarCode = barCode;
                }
            }

            Unit_Of_Work.shopItem_Repository.Update(ShopItem);

            if (newShopItem.ShopItemColors != null)
            {
                foreach (var item in newShopItem.ShopItemColors)
                {
                    ShopItemColor shopItemColor = new ShopItemColor();
                    shopItemColor.Name = item;
                    shopItemColor.ShopItemID = ShopItem.ID;

                    shopItemColor.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        shopItemColor.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        shopItemColor.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.shopItemColor_Repository.Add(shopItemColor);
                }
            }

            if (newShopItem.ShopItemSizes != null)
            {
                foreach (var item in newShopItem.ShopItemSizes)
                {
                    ShopItemSize shopItemSize = new ShopItemSize();
                    shopItemSize.Name = item;
                    shopItemSize.ShopItemID = ShopItem.ID;

                    shopItemSize.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        shopItemSize.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        shopItemSize.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.shopItemSize_Repository.Add(shopItemSize);
                }
            }
            Unit_Of_Work.SaveChanges();
            return Ok(newShopItem);
        }

        //////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Shop Item" }
        )]
        public async Task<IActionResult> Edit([FromForm] ShopItemPutDTO newShopItem)
        {
            // NOTE: I look at the image not only the file as if the file is null but i have the link in image so the data won't be removed but if the image also is null so remove the past file if exists

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (newShopItem == null)
            {
                return BadRequest("Shop Item cannot be null");
            }

            ShopItem existingShopItem = Unit_Of_Work.shopItem_Repository.First_Or_Default(
                d => d.ID == newShopItem.ID && d.IsDeleted != true
                );
            if (existingShopItem == null)
            {
                return NotFound("There is no Shop Item with this ID");
            }

            InventorySubCategories invSubCat = Unit_Of_Work.inventorySubCategories_Repository.First_Or_Default(
                d => d.ID == newShopItem.InventorySubCategoriesID && d.IsDeleted != true
                );
            if (invSubCat == null)
            {
                return NotFound("No Inventory Sub Categories With this ID");
            }

            School school = Unit_Of_Work.school_Repository.First_Or_Default(
                d => d.ID == newShopItem.SchoolID && d.IsDeleted != true
                );
            if (school == null)
            {
                return NotFound("No School With this ID");
            }

            if (newShopItem.GradeID != 0 && newShopItem.GradeID != null)
            {
                Grade grade = Unit_Of_Work.grade_Repository.First_Or_Default(
                    d => d.ID == newShopItem.GradeID && d.IsDeleted != true
                    );
                if (grade == null)
                {
                    return NotFound("No Grade With this ID");
                }
            }
            else
            {
                newShopItem.GradeID = null;
            }

            if (newShopItem.GenderID != 0 && newShopItem.GenderID != null)
            {
                Gender gender = Unit_Of_Work.gender_Repository.First_Or_Default(
                    d => d.ID == newShopItem.GenderID
                    );
                if (gender == null)
                {
                    return NotFound("No Gender With this ID");
                }
            }
            else
            {
                newShopItem.GenderID = null;
            }

            if (existingShopItem.BarCode != newShopItem.BarCode)
            {
                ShopItem shopItem = Unit_Of_Work.shopItem_Repository.First_Or_Default(
                    d => d.BarCode == newShopItem.BarCode && d.IsDeleted != true
                    );

                if (shopItem != null)
                {
                    return BadRequest("BarCode Must Be unique");
                }
            }

            if (newShopItem.MainImageFile != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(newShopItem.MainImageFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }
            if (newShopItem.OtherImageFile != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(newShopItem.OtherImageFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            string mainImageLinkExists = existingShopItem.MainImage;
            string otherImageLinkExists = existingShopItem.OtherImage;

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Shop Item", roleId, userId, existingShopItem);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            if (newShopItem.MainImageFile != null)
            {
                newShopItem.MainImage = await _fileService.ReplaceFileAsync(
                    newShopItem.MainImageFile,
                    mainImageLinkExists,
                    "Inventory/ShopItems/MainImage",
                    existingShopItem.ID,
                    HttpContext
                );
            }
            else
            {
                newShopItem.MainImage = mainImageLinkExists;
            }
            
            if (newShopItem.OtherImageFile != null)
            {
                newShopItem.OtherImage = await _fileService.ReplaceFileAsync(
                    newShopItem.OtherImageFile,
                    otherImageLinkExists,
                    "Inventory/ShopItems/OtherImage",
                    existingShopItem.ID,
                    HttpContext
                );
            }
            else
            {
                newShopItem.OtherImage = otherImageLinkExists;
            }
             
            mapper.Map(newShopItem, existingShopItem);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            existingShopItem.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                existingShopItem.UpdatedByOctaId = userId;
                if (existingShopItem.UpdatedByUserId != null)
                {
                    existingShopItem.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                existingShopItem.UpdatedByUserId = userId;
                if (existingShopItem.UpdatedByOctaId != null)
                {
                    existingShopItem.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.shopItem_Repository.Update(existingShopItem);

            List<ShopItemColor> shopItemColorExists = await Unit_Of_Work.shopItemColor_Repository.Select_All_With_IncludesById<ShopItemColor>(
                d => d.ShopItemID == existingShopItem.ID
                );

            if (shopItemColorExists.Count > 0)
            {
                foreach (var item in shopItemColorExists)
                {
                    item.IsDeleted = true;
                    item.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        item.DeletedByOctaId = userId;
                        if (item.DeletedByUserId != null)
                        {
                            item.DeletedByUserId = null;
                        }
                    }
                    else if (userTypeClaim == "employee")
                    {
                        item.DeletedByUserId = userId;
                        if (item.DeletedByOctaId != null)
                        {
                            item.DeletedByOctaId = null;
                        }
                    }

                    Unit_Of_Work.shopItemColor_Repository.Update(item);
                }
            }

            List<ShopItemSize> shopItemSizeExists = await Unit_Of_Work.shopItemSize_Repository.Select_All_With_IncludesById<ShopItemSize>(
                d => d.ShopItemID == existingShopItem.ID
                );

            if (shopItemSizeExists.Count > 0)
            {
                foreach (var item in shopItemSizeExists)
                {
                    item.IsDeleted = true;
                    item.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        item.DeletedByOctaId = userId;
                        if (item.DeletedByUserId != null)
                        {
                            item.DeletedByUserId = null;
                        }
                    }
                    else if (userTypeClaim == "employee")
                    {
                        item.DeletedByUserId = userId;
                        if (item.DeletedByOctaId != null)
                        {
                            item.DeletedByOctaId = null;
                        }
                    }

                    Unit_Of_Work.shopItemSize_Repository.Update(item);
                }
            }

            if (newShopItem.ShopItemColors != null)
            {
                foreach (var item in newShopItem.ShopItemColors)
                {
                    ShopItemColor shopItemColor = new ShopItemColor();
                    shopItemColor.Name = item;
                    shopItemColor.ShopItemID = existingShopItem.ID;

                    shopItemColor.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        shopItemColor.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        shopItemColor.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.shopItemColor_Repository.Add(shopItemColor);
                }
            }

            if (newShopItem.ShopItemSizes != null)
            {
                foreach (var item in newShopItem.ShopItemSizes)
                {
                    ShopItemSize shopItemSize = new ShopItemSize();
                    shopItemSize.Name = item;
                    shopItemSize.ShopItemID = existingShopItem.ID;

                    shopItemSize.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        shopItemSize.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        shopItemSize.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.shopItemSize_Repository.Add(shopItemSize);
                }
            }

            Unit_Of_Work.SaveChanges();
            return Ok(newShopItem);
        }

        //////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Shop Item", "Shop" }
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
                return BadRequest("Enter Sub Category ID");
            }

            ShopItem shopItem = Unit_Of_Work.shopItem_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);

            if (shopItem == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Shop Item", roleId, userId, shopItem);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            shopItem.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            shopItem.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                shopItem.DeletedByOctaId = userId;
                if (shopItem.DeletedByUserId != null)
                {
                    shopItem.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                shopItem.DeletedByUserId = userId;
                if (shopItem.DeletedByOctaId != null)
                {
                    shopItem.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.shopItem_Repository.Update(shopItem);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
