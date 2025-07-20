using AutoMapper;
using LMS_CMS_BL.DTO.Administration;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Administration
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class AnnouncementController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileImageValidationService _fileImageValidationService;

        public AnnouncementController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileImageValidationService fileImageValidationService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileImageValidationService = fileImageValidationService;
        }

        //////////////////////////////////////////////////////////////////////////////////////////
        
        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Announcement" }
        )]
        public async Task<IActionResult> GetAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<Announcement> announcements = await Unit_Of_Work.announcement_Repository.Select_All_With_IncludesById<Announcement>(
                    f => f.IsDeleted != true,
                    query => query.Include(d => d.AnnouncementSharedTos.Where(d => d.IsDeleted != true)).ThenInclude(d=>d.UserType)
                    );

            if (announcements == null || announcements.Count == 0)
            {
                return NotFound();
            }

            List<AnnouncementGetDTO> announcementGetDTO = mapper.Map<List<AnnouncementGetDTO>>(announcements);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var announcement in announcementGetDTO)
            {
                if (!string.IsNullOrEmpty(announcement.ImageLink))
                {
                    announcement.ImageLink = $"{serverUrl}{announcement.ImageLink.Replace("\\", "/")}";
                }
            }

            return Ok(announcementGetDTO);
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////
        
        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Announcement" }
        )]
        public async Task<IActionResult> GetByID(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Announcement announcement = await Unit_Of_Work.announcement_Repository.FindByIncludesAsync(
                d => d.IsDeleted != true && d.ID == id,
                query => query.Include(d => d.AnnouncementSharedTos.Where(d => d.IsDeleted != true)).ThenInclude(d => d.UserType)
                );
              
            if (announcement == null)
            {
                return NotFound();
            }

            AnnouncementGetDTO announcementGetDTO = mapper.Map<AnnouncementGetDTO>(announcement);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            if (!string.IsNullOrEmpty(announcement.ImageLink))
            {
                announcementGetDTO.ImageLink = $"{serverUrl}{announcementGetDTO.ImageLink.Replace("\\", "/")}";
            } 

            return Ok(announcementGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Announcement" }
        )]
        public async Task<IActionResult> AddAsync([FromForm]AnnouncementAddDTO NewAnnouncement)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (NewAnnouncement == null)
            {
                return BadRequest("Announcement cannot be null");
            } 
             
            Announcement announcement = mapper.Map<Announcement>(NewAnnouncement);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            announcement.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                announcement.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                announcement.InsertedByUserId = userId;
            }

            announcement.ImageLink = "";
            Unit_Of_Work.announcement_Repository.Add(announcement);
            Unit_Of_Work.SaveChanges();


            string returnFileInput = _fileImageValidationService.ValidateImageFile(NewAnnouncement.ImageFile);
            if (returnFileInput != null)
            {
                return BadRequest(returnFileInput);
            }

            var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Announcement");
            var subjectFolder = Path.Combine(baseFolder, announcement.ID.ToString());
            if (!Directory.Exists(subjectFolder))
            {
                Directory.CreateDirectory(subjectFolder);
            }

            if (NewAnnouncement.ImageFile != null)
            {
                if (NewAnnouncement.ImageFile.Length > 0)
                {
                    var filePath = Path.Combine(subjectFolder, NewAnnouncement.ImageFile.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await NewAnnouncement.ImageFile.CopyToAsync(stream);
                    }
                }
            }

            announcement.ImageLink = Path.Combine("Uploads", "Announcement", announcement.ID.ToString(), NewAnnouncement.ImageFile.FileName);
            Unit_Of_Work.announcement_Repository.Update(announcement);

            foreach (long userTypeID in NewAnnouncement.UserTypeIDs)
            {
                UserType userType = Unit_Of_Work.userType_Repository.First_Or_Default(g => g.ID == userTypeID);
                if (userType != null)
                {
                    AnnouncementSharedTo announcementSharedTo = new AnnouncementSharedTo();
                    announcementSharedTo.AnnouncementID = announcement.ID;
                    announcementSharedTo.UserTypeID = userTypeID;
                    announcementSharedTo.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        announcementSharedTo.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        announcementSharedTo.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.announcementSharedTo_Repository.Add(announcementSharedTo);
                }

            } 

            Unit_Of_Work.SaveChanges();
            return Ok();
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Announcement" }
        )]
        public async Task<IActionResult> Edit([FromForm] AnnouncementPutDTO EditAnnouncement)
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

            if (EditAnnouncement == null)
            {
                return BadRequest("Announcement cannot be null");
            } 

            Announcement announcementExists = Unit_Of_Work.announcement_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == EditAnnouncement.ID);

            if (announcementExists == null)
            {
                return NotFound();
            }

            if (EditAnnouncement.ImageFile != null)
            {
                string returnFileInput = _fileImageValidationService.ValidateImageFile(EditAnnouncement.ImageFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            string imageLinkExists = announcementExists.ImageLink;  

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Announcement", roleId, userId, announcementExists);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            if (EditAnnouncement.ImageFile != null)
            {
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Announcement"); 
                var announcementFolder = Path.Combine(baseFolder, EditAnnouncement.ID.ToString());

                if (System.IO.File.Exists(announcementFolder))
                {
                    System.IO.File.Delete(announcementFolder); // Delete the old file
                }

                if (Directory.Exists(announcementFolder))
                {
                    Directory.Delete(announcementFolder, true);
                }

                if (!Directory.Exists(announcementFolder))
                {
                    Directory.CreateDirectory(announcementFolder);
                }

                if (EditAnnouncement.ImageFile.Length > 0)
                {
                    var filePath = Path.Combine(announcementFolder, EditAnnouncement.ImageFile.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await EditAnnouncement.ImageFile.CopyToAsync(stream);
                    }
                }

                EditAnnouncement.ImageLink = Path.Combine("Uploads", "Announcement", EditAnnouncement.ID.ToString(), EditAnnouncement.ImageFile.FileName);
            }
            else
            {
                EditAnnouncement.ImageLink = imageLinkExists;
            }

            mapper.Map(EditAnnouncement, announcementExists);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            announcementExists.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                announcementExists.UpdatedByOctaId = userId;
                if (announcementExists.UpdatedByUserId != null)
                {
                    announcementExists.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                announcementExists.UpdatedByUserId = userId;
                if (announcementExists.UpdatedByOctaId != null)
                {
                    announcementExists.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.announcement_Repository.Update(announcementExists);

            List<AnnouncementSharedTo> announcementSharedTos = Unit_Of_Work.announcementSharedTo_Repository.FindBy(d => d.AnnouncementID == EditAnnouncement.ID && d.IsDeleted != true);
            List<long> existingUserTypeIDs = announcementSharedTos.Select(a => a.UserTypeID).ToList();
            
            var userTypeIDsToAdd = EditAnnouncement.UserTypeIDs.Except(existingUserTypeIDs).ToList();
            var userTypeIDsToRemove = existingUserTypeIDs.Except(EditAnnouncement.UserTypeIDs).ToList();

            foreach (long userTypeID in userTypeIDsToRemove)
            {
                var announcementSharedTo = announcementSharedTos.FirstOrDefault(a => a.UserTypeID == userTypeID); 
                announcementSharedTo.IsDeleted = true; 
                announcementSharedTo.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    announcementSharedTo.DeletedByOctaId = userId;
                    if (announcementSharedTo.DeletedByUserId != null)
                    {
                        announcementSharedTo.DeletedByUserId = null;
                    }
                }
                else if (userTypeClaim == "employee")
                {
                    announcementSharedTo.DeletedByUserId = userId;
                    if (announcementSharedTo.DeletedByOctaId != null)
                    {
                        announcementSharedTo.DeletedByOctaId = null;
                    }
                }

                Unit_Of_Work.announcementSharedTo_Repository.Update(announcementSharedTo);
            }

            foreach (long userTypeID in userTypeIDsToAdd)
            {
                UserType userType = Unit_Of_Work.userType_Repository.First_Or_Default(g => g.ID == userTypeID);
                if (userType != null)
                {
                    AnnouncementSharedTo announcementSharedTo = new AnnouncementSharedTo
                    {
                        AnnouncementID = EditAnnouncement.ID,
                        UserTypeID = userTypeID,
                        InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone)
                    };
                     
                    if (userTypeClaim == "octa")
                    {
                        announcementSharedTo.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        announcementSharedTo.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.announcementSharedTo_Repository.Add(announcementSharedTo);
                }
            }

            Unit_Of_Work.SaveChanges();
            return Ok();
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Announcement" }
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
                return BadRequest("Enter Announcement ID");
            }

            Announcement announcement = Unit_Of_Work.announcement_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);

            if (announcement == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Announcement", roleId, userId, announcement);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            announcement.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            announcement.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                announcement.DeletedByOctaId = userId;
                if (announcement.DeletedByUserId != null)
                {
                    announcement.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                announcement.DeletedByUserId = userId;
                if (announcement.DeletedByOctaId != null)
                {
                    announcement.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.announcement_Repository.Update(announcement);

            List<AnnouncementSharedTo> announcementSharedTos = Unit_Of_Work.announcementSharedTo_Repository.FindBy(d => d.AnnouncementID == id && d.IsDeleted != true);
            if (announcementSharedTos != null && announcementSharedTos.Count > 0)
            {
                foreach (var announcementSharedTo in announcementSharedTos)
                {
                    announcementSharedTo.IsDeleted = true;
                    announcementSharedTo.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        announcementSharedTo.DeletedByOctaId = userId;
                        if (announcementSharedTo.DeletedByUserId != null)
                        {
                            announcementSharedTo.DeletedByUserId = null;
                        }
                    }
                    else if (userTypeClaim == "employee")
                    {
                        announcementSharedTo.DeletedByUserId = userId;
                        if (announcementSharedTo.DeletedByOctaId != null)
                        {
                            announcementSharedTo.DeletedByOctaId = null;
                        }
                    }
                    Unit_Of_Work.announcementSharedTo_Repository.Update(announcementSharedTo);
                }
            }

            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
