using Amazon.S3;
using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.DTO.SocialWorker;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.SocialWorker;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using LMS_CMS_PL.Services.FileValidations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace LMS_CMS_PL.Controllers.Domains.SocialWorker
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class SocialWorkerMedalController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileImageValidationService _fileImageValidationService;
        private readonly FileUploadsService _fileService; 

        public SocialWorkerMedalController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileImageValidationService fileImageValidationService, FileUploadsService fileService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileImageValidationService = fileImageValidationService;
            _fileService = fileService;
        }

        ////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" },
         pages: new[] { "Medal Types" }
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

            List<SocialWorkerMedal> socialWorkerMedal = await Unit_Of_Work.socialWorkerMedal_Repository.Select_All_With_IncludesById<SocialWorkerMedal>(
                    sem => sem.IsDeleted != true);


            if (socialWorkerMedal == null || socialWorkerMedal.Count == 0)
            {
                return NotFound();
            }

            List<SocialWorkerMedalGetDTO> Dto = mapper.Map<List<SocialWorkerMedalGetDTO>>(socialWorkerMedal);
             
            foreach (var item in Dto)
            {
                item.File = _fileService.GetFileUrl(item.File, Request);
            }

            return Ok(Dto);
        }

        ////////////////////////////////     

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" },
        pages: new[] { "Medal Types" }
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

            SocialWorkerMedal socialWorkerMedal = await Unit_Of_Work.socialWorkerMedal_Repository.FindByIncludesAsync(
                    sem => sem.IsDeleted != true && sem.ID == id);

            if (socialWorkerMedal == null)
            {
                return NotFound();
            }

            SocialWorkerMedalGetDTO Dto = mapper.Map<SocialWorkerMedalGetDTO>(socialWorkerMedal);
              
            Dto.File = _fileService.GetFileUrl(Dto.File, Request);
             
            return Ok(Dto);
        }

        ////////////////////////////////     

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Medal Types" }
        )]
        public async Task<IActionResult> Add([FromForm] SocialWorkerMedalAddDTO newMedal)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (newMedal == null)
            {
                return BadRequest("Medal cannot be null");
            }
            if (newMedal.NewFile != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(newMedal.NewFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }
             
            SocialWorkerMedal medal = mapper.Map<SocialWorkerMedal>(newMedal);

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
            Unit_Of_Work.socialWorkerMedal_Repository.Add(medal);
            Unit_Of_Work.SaveChanges();

            if (newMedal.NewFile != null)
            {
                medal.File = await _fileService.UploadFileAsync(newMedal.NewFile, "SocialWorker/SocialWorkerMedal", medal.ID, HttpContext);
                Unit_Of_Work.socialWorkerMedal_Repository.Update(medal);
                Unit_Of_Work.SaveChanges();
            } 
            return Ok(newMedal);
        }

        ////////////////////////////////     

        [HttpPut]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee" },
             allowEdit: 1,
            pages: new[] { "Medal Types" }
        )]
        public async Task<IActionResult> Edit([FromForm] SocialWorkerMedalEditDTO newModal)
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

            if (newModal == null)
            {
                return BadRequest("Medal cannot be null");
            }


            if (newModal.NewFile != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(newModal.NewFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            SocialWorkerMedal medal = Unit_Of_Work.socialWorkerMedal_Repository.Select_By_Id(newModal.ID);

            string imageLinkExists = medal.File;
            if (medal == null || medal.IsDeleted == true)
            {
                return NotFound("No Medal with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Medal Types", roleId, userId, medal);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }
            mapper.Map(newModal, medal);

            medal.File = await _fileService.ReplaceFileAsync(
                newModal.NewFile,
                medal.File,
                "SocialWorker/SocialWorkerMedal",
                medal.ID,
                HttpContext
            ); 

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

            Unit_Of_Work.socialWorkerMedal_Repository.Update(medal);
            Unit_Of_Work.SaveChanges();
            return Ok(newModal);
        }

        ////////////////////////////////     

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Medal Types" }
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

            SocialWorkerMedal medal = Unit_Of_Work.socialWorkerMedal_Repository.Select_By_Id(id);


            if (medal == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Medal Types", roleId, userId, medal);
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

            Unit_Of_Work.socialWorkerMedal_Repository.Update(medal);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
