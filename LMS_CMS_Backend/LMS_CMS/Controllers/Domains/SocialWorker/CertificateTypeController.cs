using AutoMapper;
using LMS_CMS_BL.DTO.SocialWorker;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.SocialWorker;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.SocialWorker
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class CertificateTypeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileImageValidationService _fileImageValidationService;

        public CertificateTypeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileImageValidationService fileImageValidationService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileImageValidationService = fileImageValidationService;
        }

        ////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" },
         pages: new[] { "Certificate Types" }
       )]
        public async Task<IActionResult> Get()
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

            List<CertificateType> certificateType = await Unit_Of_Work.certificateType_Repository.Select_All_With_IncludesById<CertificateType>(
                    sem => sem.IsDeleted != true);


            if (certificateType == null || certificateType.Count == 0)
            {
                return NotFound();
            }

            List<CertificateTypeGetDTO> Dto = mapper.Map<List<CertificateTypeGetDTO>>(certificateType);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var item in Dto)
            {
                if (!string.IsNullOrEmpty(item.File))
                {
                    item.File = $"{serverUrl}{item.File.Replace("\\", "/")}";
                }
            }

            return Ok(Dto);
        }

        ////////////////////////////////     

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" },
        pages: new[] { "Certificate Types" }
        )]
        public async Task<IActionResult> GetById(long id)
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

            CertificateType certificateType = await Unit_Of_Work.certificateType_Repository.FindByIncludesAsync(
                    sem => sem.IsDeleted != true && sem.ID == id);

            if (certificateType == null)
            {
                return NotFound();
            }

            CertificateTypeGetDTO Dto = mapper.Map<CertificateTypeGetDTO>(certificateType);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";

            if (!string.IsNullOrEmpty(Dto.File))
            {
                Dto.File = $"{serverUrl}{Dto.File.Replace("\\", "/")}";
            }

            return Ok(Dto);
        }

        ////////////////////////////////     

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Certificate Types" }
        )]
        public async Task<IActionResult> Add([FromForm] CertificateTypeAddDTO NewCertificate)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (NewCertificate == null)
            {
                return BadRequest("Type cannot be null");
            }
            if (NewCertificate.NewFile != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(NewCertificate.NewFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }


            CertificateType medal = mapper.Map<CertificateType>(NewCertificate);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            medal.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                medal.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                medal.InsertedByUserId = userId;
            }
            medal.File = "1";
            Unit_Of_Work.certificateType_Repository.Add(medal);
            Unit_Of_Work.SaveChanges();


            var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/CertificateType");
            var medalFolder = Path.Combine(baseFolder, medal.ID.ToString());
            if (!Directory.Exists(medalFolder))
            {
                Directory.CreateDirectory(medalFolder);
            }

            if (NewCertificate.NewFile != null && NewCertificate.NewFile.Length > 0)
            {
                var fileName = Path.GetFileName(NewCertificate.NewFile.FileName);
                var filePath = Path.Combine(medalFolder, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await NewCertificate.NewFile.CopyToAsync(stream);
                }
                //medal.ImageLink = Path.Combine("Uploads", "Medal", medal.ID.ToString(), fileName);
                medal.File = $"Uploads/CertificateType/{medal.ID.ToString()}/{fileName}";
            }

            Unit_Of_Work.certificateType_Repository.Update(medal);
            Unit_Of_Work.SaveChanges();
            return Ok(NewCertificate);
        }

        ////////////////////////////////     

        [HttpPut]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee" },
             allowEdit: 1,
            pages: new[] { "Certificate Types" }
        )]
        public async Task<IActionResult> Edit([FromForm] CertificateTypeEditDTO NewCertificate)
        {
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

            if (NewCertificate == null)
            {
                return BadRequest("Certificate Types cannot be null");
            }


            if (NewCertificate.NewFile != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(NewCertificate.NewFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            CertificateType medal = Unit_Of_Work.certificateType_Repository.Select_By_Id(NewCertificate.ID);

            string imageLinkExists = medal.File;
            if (medal == null || medal.IsDeleted == true)
            {
                return NotFound("No Certificate Types with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Certificate Types", roleId, userId, medal);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }
            mapper.Map(NewCertificate, medal);

            if (NewCertificate.NewFile != null)
            {
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/SocialWorkerMedal");
                var oldMedalFolder = Path.Combine(baseFolder, NewCertificate.ID.ToString());
                var medalFolder = Path.Combine(baseFolder, NewCertificate.ID.ToString());


                if (System.IO.File.Exists(oldMedalFolder))
                {
                    System.IO.File.Delete(oldMedalFolder); // Delete the old file
                }

                if (Directory.Exists(oldMedalFolder))
                {
                    Directory.Delete(oldMedalFolder, true);
                }

                if (!Directory.Exists(medalFolder))
                {
                    Directory.CreateDirectory(medalFolder);
                }

                var fileName = Path.GetFileName(NewCertificate.NewFile.FileName);
                var filePath = Path.Combine(medalFolder, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await NewCertificate.NewFile.CopyToAsync(stream);
                }
                medal.File = $"Uploads/SocialWorkerMedal/{medal.ID.ToString()}/{fileName}";

            }


            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            medal.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                medal.UpdatedByOctaId = userId;
                if (medal.UpdatedByUserId != null)
                {
                    medal.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                medal.UpdatedByUserId = userId;
                if (medal.UpdatedByOctaId != null)
                {
                    medal.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.certificateType_Repository.Update(medal);
            Unit_Of_Work.SaveChanges();
            return Ok(NewCertificate);
        }

        ////////////////////////////////     

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Certificate Types" }
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
                return BadRequest("Enter medal ID");
            }

            CertificateType medal = Unit_Of_Work.certificateType_Repository.Select_By_Id(id);


            if (medal == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Certificate Types", roleId, userId, medal);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            medal.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            medal.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                medal.DeletedByOctaId = userId;
                if (medal.DeletedByUserId != null)
                {
                    medal.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                medal.DeletedByUserId = userId;
                if (medal.DeletedByOctaId != null)
                {
                    medal.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.certificateType_Repository.Update(medal);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
