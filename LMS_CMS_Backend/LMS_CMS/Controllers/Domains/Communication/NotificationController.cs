using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using LMS_CMS_BL.DTO.Communication;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_DAL.Models.Domains.Communication;

namespace LMS_CMS_PL.Controllers.Domains.Communication
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileImageValidationService _fileImageValidationService;
        private readonly UserTreeService _userTreeService;

        public NotificationController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileImageValidationService fileImageValidationService, UserTreeService userTreeService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileImageValidationService = fileImageValidationService;
            _userTreeService = userTreeService;
        }

        [HttpPost]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Notification" }
        )]
        public async Task<IActionResult> AddAsync(NotificationAddDTO NewNotification)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (NewNotification == null)
            {
                return BadRequest("Notification cannot be null");
            }

            UserType userType = Unit_Of_Work.userType_Repository.First_Or_Default(d => d.ID == NewNotification.UserTypeID);
            if (userType == null)
            {
                return BadRequest("No User Type With this ID");
            }

            if(NewNotification.ImageFile == null && NewNotification.Text == null && NewNotification.Link == null)
            {
                return BadRequest("You have to choose one element atleast to appear");
            }
             
            List<long> targetUserIds;
            try
            {
                targetUserIds = _userTreeService.GetUsersAccordingToTree(Unit_Of_Work, NewNotification.UserTypeID, NewNotification.UserFilters);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            Notification notification = mapper.Map<Notification>(NewNotification);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            notification.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                notification.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                notification.InsertedByUserId = userId;
            }

            Unit_Of_Work.notification_Repository.Add(notification);
            Unit_Of_Work.SaveChanges();

            if(NewNotification.ImageFile != null)
            {
                string returnFileInput = _fileImageValidationService.ValidateImageFile(NewNotification.ImageFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }

                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Notification");
                var subjectFolder = Path.Combine(baseFolder, notification.ID.ToString());
                if (!Directory.Exists(subjectFolder))
                {
                    Directory.CreateDirectory(subjectFolder);
                }
                
                if (NewNotification.ImageFile.Length > 0)
                {
                    var filePath = Path.Combine(subjectFolder, NewNotification.ImageFile.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await NewNotification.ImageFile.CopyToAsync(stream);
                    }
                }

                notification.ImageLink = Path.Combine("Uploads", "Notification", notification.ID.ToString(), NewNotification.ImageFile.FileName);
                Unit_Of_Work.notification_Repository.Update(notification); 
            }

            foreach (long userID in targetUserIds)
            {
                NotificationSharedTo notificationSharedTo = new NotificationSharedTo();
                notificationSharedTo.NotificationID = notification.ID;
                notificationSharedTo.UserTypeID = NewNotification.UserTypeID;
                notificationSharedTo.UserID = userID;
                notificationSharedTo.NotifiedOrNot = false;
                notificationSharedTo.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    notificationSharedTo.InsertedByOctaId = userId;
                }
                else if (userTypeClaim == "employee")
                {
                    notificationSharedTo.InsertedByUserId = userId;
                }

                Unit_Of_Work.notificationSharedTo_Repository.Add(notificationSharedTo);  
            }

            Unit_Of_Work.SaveChanges();
            return Ok();  
        }
    }
}
