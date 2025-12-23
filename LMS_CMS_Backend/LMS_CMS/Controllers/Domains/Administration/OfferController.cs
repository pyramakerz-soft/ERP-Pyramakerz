using AutoMapper;
using LMS_CMS_BL.DTO.Administration; // عدل المسار حسب مكان DTOs بتاعت Offer
using LMS_CMS_BL.DTO.Violation;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_DAL.Models.Domains.ViolationModule;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using LMS_CMS_PL.Services.S3;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static StackExchange.Redis.Role;

namespace LMS_CMS_PL.Controllers.Domains.Administration
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class OfferController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileValidationService _fileValidationService;
        private readonly FileUploadsService _fileService;

        public OfferController( DbContextFactoryService dbContextFactory,IMapper mapper, CheckPageAccessService checkPageAccessService,FileValidationService fileValidationService,FileUploadsService fileService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileValidationService = fileValidationService;
            _fileService = fileService;
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////// GET: api/with-domain/Offer
        [HttpGet]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee", "parent", "student" })]
        public async Task<IActionResult> GetAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);


            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            List<Offer> offers = await Unit_Of_Work.offer_Repository.Select_All_With_IncludesById<Offer>(
         o => o.IsDeleted != true,
         qu => qu.Include(o => o.Department),
         qu => qu.Include(o => o.Title));

            if (offers == null || offers.Count == 0)
                return NotFound("No Found");

           List<OfferGetDto> offerDtos = mapper.Map<List<OfferGetDto>>(offers);

            foreach (var offer in offerDtos)
            {
                offer.UploadedFilePath = _fileService.GetFileUrl(offer.UploadedFilePath, Request, HttpContext);
            }

            return Ok(offerDtos);
        }

        ///////////////////////////////////////////////////////////////////////////////////////// GET: api/with-domain/Offer/{id}
        [HttpGet("{id}")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Offer" })]
        public async Task<IActionResult> GetByIdAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            var offer = await Unit_Of_Work.offer_Repository.FindByIncludesAsync(
                o => o.IsDeleted != true && o.ID == id,
                quar => quar.Include(o => o.Department),
                quar => quar.Include(o => o.Title));

            if (offer == null)
                return NotFound();

            var offerDto = mapper.Map<OfferGetDto>(offer);
            offerDto.UploadedFilePath = _fileService.GetFileUrl(offerDto.UploadedFilePath, Request, HttpContext);

            return Ok(offerDto);
        }


        ///////////////////////////////////////////////////////////////////////////////////// POST: api/with-domain/Offer
        //[HttpPost]
        //[Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Offer" })]
        //public async Task<IActionResult> Add([FromForm] OfferAddDto newOffer)
        //{
        //    if (newOffer == null)
        //        return BadRequest("Offer data is required");
        //    UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

        //    var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
        //    long.TryParse(userIdClaim, out long userId);
        //    var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

        //    if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
        //        return Unauthorized("User claims not found");

        //    // تحقق من Department و Title
        //    var dept = Unit_Of_Work.department_Repository.First_Or_Default(d => d.ID == newOffer.DepartmentID && d.IsDeleted != true);
        //    if (dept == null) return BadRequest("Invalid Department");

        //    var title = Unit_Of_Work.title_Repository.First_Or_Default(t => t.ID == newOffer.TitleID && t.DepartmentID == newOffer.DepartmentID && t.IsDeleted != true);
        //    if (title == null) return BadRequest("Invalid Title");

        //    // تحقق من الملف
        //    if (newOffer.UploadedFile == null || newOffer.UploadedFile.Length == 0)
        //        return BadRequest("File is required");

        //    if (newOffer.UploadedFile.Length > 25 * 1024 * 1024) // 25MB
        //        return BadRequest("File size exceeds 25MB");

        //    string validationResult = await _fileValidationService.ValidateFileWithTimeoutAsync(newOffer.UploadedFile);
        //    if (validationResult != null)
        //        return BadRequest(validationResult);

        //    var offer = _mapper.Map<Offer>(newOffer);

        //    TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
        //    offer.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
        //    offer.TimeLogged = DateTime.Now; // التاريخ التلقائي

        //    if (userTypeClaim == "octa")
        //        offer.InsertedByOctaId = userId;
        //    else if (userTypeClaim == "employee")
        //        offer.InsertedByUserId = userId;

        //    Unit_Of_Work.offer_Repository.Add(offer);
        //    Unit_Of_Work.SaveChanges(); // لازم Save عشان نأخذ الـ ID

        //    // رفع الملف بعد حفظ الـ Offer عشان نستخدم الـ ID
        //    offer.UploadedFilePath = await _fileService.UploadFileAsync(
        //        newOffer.UploadedFile,
        //        "Offer/Offer",  // مجلد التخزين
        //        offer.ID,
        //        HttpContext);

        //    Unit_Of_Work.offer_Repository.Update(offer);
        //    Unit_Of_Work.SaveChanges();

        //    var result = _mapper.Map<OfferGetDto>(offer);
        //    result.UploadedFilePath = _fileService.GetFileUrl(result.UploadedFilePath, Request, HttpContext);

        //    return Ok(result);
        //}

        ///////////////////////////////////////////////////////////////////////////////////////////////////// PUT: api/with-domain/Offer
        //[HttpPut]
        //[Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, allowEdit: 1, pages: new[] { "Offer" })]
        //public async Task<IActionResult> Edit([FromForm] OfferEditDto updatedOffer)
        //{
        //    if (updatedOffer == null)
        //        return BadRequest("Offer data is required");

        //    UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

        //    var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
        //    long.TryParse(userIdClaim, out long userId);
        //    var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
        //    var roleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
        //    long.TryParse(roleClaim, out long roleId);

        //    if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
        //        return Unauthorized("User claims not found");

        //    var offer = Unit_Of_Work.offer_Repository.First_Or_Default(o => o.ID == updatedOffer.ID && o.IsDeleted != true);
        //    if (offer == null)
        //        return NotFound();

        //    // تحقق من الصلاحيات لو employee
        //    if (userTypeClaim == "employee")
        //    {
        //        IActionResult? access = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Offer", roleId, userId, offer.Department);
        //        if (access != null) return access;
        //    }

        //    // تحقق من الملف الجديد لو موجود
        //    if (updatedOffer.UploadedFile != null)
        //    {
        //        if (updatedOffer.UploadedFile.Length > 25 * 1024 * 1024)
        //            return BadRequest("File size exceeds 25MB");

        //        string validationResult = await _fileValidationService.ValidateFileWithTimeoutAsync(updatedOffer.UploadedFile);
        //        if (validationResult != null)
        //            return BadRequest(validationResult);

        //        // استبدال الملف القديم
        //        offer.UploadedFilePath = await _fileService.ReplaceFileAsync(
        //            updatedOffer.UploadedFile,
        //            offer.UploadedFilePath,
        //            "Offer/Offer",
        //            offer.ID,
        //            HttpContext);
        //    }
        //    else if (!string.IsNullOrEmpty(updatedOffer.DeletedFile))
        //    {
        //        // حذف الملف لو الـ Client طلب حذف
        //        await _fileService.DeleteFileAsync(
        //            updatedOffer.DeletedFile,
        //            "Offer/Offer",
        //            updatedOffer.ID,
        //            HttpContext);
        //        offer.UploadedFilePath = null;
        //    }

        //    _mapper.Map(updatedOffer, offer);

        //    TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
        //    offer.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

        //    if (userTypeClaim == "octa")
        //    {
        //        offer.UpdatedByOctaId = userId;
        //        offer.UpdatedByUserId = null;
        //    }
        //    else if (userTypeClaim == "employee")
        //    {
        //        offer.UpdatedByUserId = userId;
        //        offer.UpdatedByOctaId = null;
        //    }

        //    Unit_Of_Work.offer_Repository.Update(offer);
        //    Unit_Of_Work.SaveChanges();

        //    var result = _mapper.Map<OfferGetDto>(offer);
        //    result.UploadedFilePath = _fileService.GetFileUrl(result.UploadedFilePath, Request, HttpContext);

        //    return Ok(result);
        //}

        /////////////////////////////////////////////////////////////////////////////////////////////////// DELETE: api/with-domain/Offer/{id}
        //[HttpDelete("{id}")]
        //[Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, allowDelete: 1, pages: new[] { "Offer" })]
        //public async Task<IActionResult> Delete(long id)
        //{
        //    UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

        //    var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
        //    long.TryParse(userIdClaim, out long userId);
        //    var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
        //    var roleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
        //    long.TryParse(roleClaim, out long roleId);

        //    if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
        //        return Unauthorized("User claims not found");

        //    var offer = Unit_Of_Work.offer_Repository.First_Or_Default(o => o.ID == id && o.IsDeleted != true,
        //        q => q.Include(o => o.Department));

        //    if (offer == null)
        //        return NotFound();

        //    if (userTypeClaim == "employee")
        //    {
        //        IActionResult? access = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Offer", roleId, userId, offer.Department);
        //        if (access != null) return access;
        //    }

        //    // حذف الملف لو موجود
        //    if (!string.IsNullOrEmpty(offer.UploadedFilePath))
        //    {
        //        await _fileService.DeleteFileAsync(offer.UploadedFilePath, "Offer/Offer", id, HttpContext);
        //    }

        //    offer.IsDeleted = true;
        //    TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
        //    offer.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

        //    if (userTypeClaim == "octa")
        //    {
        //        offer.DeletedByOctaId = userId;
        //        offer.DeletedByUserId = null;
        //    }
        //    else if (userTypeClaim == "employee")
        //    {
        //        offer.DeletedByUserId = userId;
        //        offer.DeletedByOctaId = null;
        //    }

        //    Unit_Of_Work.offer_Repository.Update(offer);
        //    Unit_Of_Work.SaveChanges();

        //    return Ok();
        //}
    }
}

