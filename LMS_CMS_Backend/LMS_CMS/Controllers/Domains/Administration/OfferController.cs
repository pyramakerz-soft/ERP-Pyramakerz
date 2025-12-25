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
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Offers" })]
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
        [HttpPost]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Offers" })]
        public async Task<IActionResult> Add([FromForm] OfferAddDto newOffer)
        {
            if (newOffer == null)
                return BadRequest("Offer data is required");

            try
            {
                UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
                    return Unauthorized("User claims not found");

                if (!long.TryParse(userIdClaim, out long userId))
                    return Unauthorized("Invalid user ID claim");

                var dept = Unit_Of_Work.department_Repository.First_Or_Default(d => d.ID == newOffer.DepartmentID && d.IsDeleted != true);
                if (dept == null) return BadRequest("Invalid Department");

                var title = Unit_Of_Work.title_Repository.First_Or_Default(t => t.ID == newOffer.TitleID && t.DepartmentID == newOffer.DepartmentID && t.IsDeleted != true);
                if (title == null) return BadRequest("Invalid Title");

                if (newOffer.UploadedFile == null || newOffer.UploadedFile.Length == 0)
                    return BadRequest("File is required");

                //if (newOffer.UploadedFile.Length > 25 * 1024 * 1024) // 25MB
                //    return BadRequest("File size exceeds 25MB");

                Offer offer = mapper.Map<Offer>(newOffer);

                TimeZoneInfo cairoZone;
                try
                {
                    cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                }
                catch
                {
                    cairoZone = TimeZoneInfo.Local; // fallback
                }
                offer.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                offer.TimeLogged = DateTime.Now;

                if (userTypeClaim == "octa")
                    offer.InsertedByOctaId = userId;
                else if (userTypeClaim == "employee")
                    offer.InsertedByUserId = userId;

                offer.UploadedFilePath = "temp";

                Unit_Of_Work.offer_Repository.Add(offer);
                Unit_Of_Work.SaveChanges();

                offer.UploadedFilePath = await _fileService.UploadFileAsync(newOffer.UploadedFile, "Offer/Offer", offer.ID, HttpContext);
                Unit_Of_Work.offer_Repository.Update(offer);
                Unit_Of_Work.SaveChanges();

                var result = mapper.Map<OfferGetDto>(offer);
                result.UploadedFilePath = _fileService.GetFileUrl(result.UploadedFilePath, Request, HttpContext);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}\n{ex.StackTrace}");
            }
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////// PUT: api/with-domain/Offer
        [HttpPut("{id}")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Offers" })]
        public async Task<IActionResult> Update(long id, [FromForm] OfferAddDto updatedOffer)
        {
            if (updatedOffer == null)
                return BadRequest("Offer data is required");

            try
            {
                UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
                    return Unauthorized("User claims not found");

                if (!long.TryParse(userIdClaim, out long userId))
                    return Unauthorized("Invalid user ID claim");

                var offer = Unit_Of_Work.offer_Repository.First_Or_Default(o => o.ID == id);
                if (offer == null)
                    return NotFound("Offer not found");

                var dept = Unit_Of_Work.department_Repository.First_Or_Default(d => d.ID == updatedOffer.DepartmentID && d.IsDeleted != true);
                if (dept == null) return BadRequest("Invalid Department");

                var title = Unit_Of_Work.title_Repository.First_Or_Default(t => t.ID == updatedOffer.TitleID && t.DepartmentID == updatedOffer.DepartmentID && t.IsDeleted != true);
                if (title == null) return BadRequest("Invalid Title");

                mapper.Map(updatedOffer, offer);

                TimeZoneInfo cairoZone;
                try
                {
                    cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                }
                catch
                {
                    cairoZone = TimeZoneInfo.Local;
                }
                offer.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                offer.TimeLogged = DateTime.Now;

                if (userTypeClaim == "octa")
                    offer.UpdatedByOctaId = userId;
                else if (userTypeClaim == "employee")
                    offer.UpdatedByUserId = userId;

                if (updatedOffer.UploadedFile != null && updatedOffer.UploadedFile.Length > 0)
                {
                    //if (updatedOffer.UploadedFile.Length > 25 * 1024 * 1024)
                    //    return BadRequest("File size exceeds 25MB");

                    offer.UploadedFilePath = await _fileService.UploadFileAsync(updatedOffer.UploadedFile, "Offer/Offer", offer.ID, HttpContext);
                }

                Unit_Of_Work.offer_Repository.Update(offer);
                Unit_Of_Work.SaveChanges();

                var result = mapper.Map<OfferGetDto>(offer);
                result.UploadedFilePath = _fileService.GetFileUrl(result.UploadedFilePath, Request, HttpContext);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}\n{ex.StackTrace}");
            }
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////// DELETE: api/with-domain/Offer/{id}
        [HttpDelete("{id}")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Offers" })]
        public IActionResult Delete(long id, [FromQuery] bool softDelete = true)
        {
            try
            {
                UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
                    return Unauthorized("User claims not found");

                if (!long.TryParse(userIdClaim, out long userId))
                    return Unauthorized("Invalid user ID claim");

                var offer = Unit_Of_Work.offer_Repository.First_Or_Default(o => o.ID == id);
                if (offer == null)
                    return NotFound("Offer not found");

                if (softDelete)
                {
                    offer.IsDeleted = true;

                    TimeZoneInfo cairoZone;
                    try { cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time"); }
                    catch { cairoZone = TimeZoneInfo.Local; }
                    offer.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    offer.UpdatedByUserId = userTypeClaim == "employee" ? userId : null;
                    offer.UpdatedByOctaId = userTypeClaim == "octa" ? userId : null;

                    Unit_Of_Work.offer_Repository.Update(offer);
                }
                else
                {
                    Unit_Of_Work.offer_Repository.Update(offer);
                }

                Unit_Of_Work.SaveChanges();

                return Ok(new { message = softDelete ? "Offer soft deleted successfully" : "Offer deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}\n{ex.StackTrace}");
            }
        }

    }

}


