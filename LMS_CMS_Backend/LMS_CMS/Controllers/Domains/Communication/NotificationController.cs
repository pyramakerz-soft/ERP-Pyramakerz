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
using LMS_CMS_BL.DTO.Administration;
using Microsoft.EntityFrameworkCore;

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

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Notification" }
        )]
        public async Task<IActionResult> GetAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<Notification> notifications = await Unit_Of_Work.notification_Repository.Select_All_With_IncludesById<Notification>(
                    f => f.IsDeleted != true,
                    query => query.Include(d => d.NotificationSharedTos.Where(d => d.IsDeleted != true))
                    );

            if (notifications == null || notifications.Count == 0)
            {
                return NotFound();
            }

            List<NotificationGetDTO> notificationGetDTO = mapper.Map<List<NotificationGetDTO>>(notifications);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var notification in notificationGetDTO)
            {
                if (!string.IsNullOrEmpty(notification.ImageLink))
                {
                    notification.ImageLink = $"{serverUrl}{notification.ImageLink.Replace("\\", "/")}";
                }
            }

            return Ok(notificationGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////
        
        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Notification" }
        )]
        public async Task<IActionResult> GetByID(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Notification notification = await Unit_Of_Work.notification_Repository.FindByIncludesAsync(
                    f => f.IsDeleted != true && f.ID == id,
                    query => query.Include(d => d.NotificationSharedTos.Where(d => d.IsDeleted != true))
                    );

            if (notification == null)
            {
                return NotFound();
            }

            NotificationGetDTO notificationGetDTO = mapper.Map<NotificationGetDTO>(notification);
            if(notificationGetDTO.NotificationSharedTos != null && notificationGetDTO.NotificationSharedTos.Count != 0)
            {
                notificationGetDTO.UserTypeID = notificationGetDTO.NotificationSharedTos[0].UserTypeID;
            }
            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            if (!string.IsNullOrEmpty(notification.ImageLink))
            {
                notificationGetDTO.ImageLink = $"{serverUrl}{notification.ImageLink.Replace("\\", "/")}";
            } 

            return Ok(notificationGetDTO);
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////
        
        [HttpGet("ByUserID")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> ByUserID()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            }
            else if (userTypeClaim == "student")
            {
                userTypeID = 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            List<NotificationSharedTo> notificationSharedTos = await Unit_Of_Work.notificationSharedTo_Repository.Select_All_With_IncludesById<NotificationSharedTo>(
                    f => f.IsDeleted != true && f.Notification.IsDeleted != true && f.UserID == userId && f.UserTypeID == userTypeID,
                    query => query.Include(d => d.Notification)
                    );

            notificationSharedTos = notificationSharedTos
                .OrderByDescending(d => d.InsertedAt)
                .ToList();

            if (notificationSharedTos == null || notificationSharedTos.Count == 0)
            {
                return NotFound();
            }

            List<NotificationSharedToGetDTO> notificationSharedToGetDTO = mapper.Map<List<NotificationSharedToGetDTO>>(notificationSharedTos);

            foreach (var notificationSharedTo in notificationSharedToGetDTO)
            {
                string serverUrl = $"{Request.Scheme}://{Request.Host}/";
                if (!string.IsNullOrEmpty(notificationSharedTo.ImageLink))
                {
                    notificationSharedTo.ImageLink = $"{serverUrl}{notificationSharedTo.ImageLink.Replace("\\", "/")}";
                }
            }

            return Ok(notificationSharedToGetDTO);
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////
        
        [HttpGet("ByUserIDFirst5")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> ByUserIDFirst5()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            }
            else if (userTypeClaim == "student")
            {
                userTypeID = 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            List<NotificationSharedTo> notificationSharedTos = await Unit_Of_Work.notificationSharedTo_Repository.Select_All_With_IncludesById<NotificationSharedTo>(
                    f => f.IsDeleted != true && f.Notification.IsDeleted != true && f.UserID == userId && f.UserTypeID == userTypeID,
                    query => query.Include(d => d.Notification)
                    );

            notificationSharedTos = notificationSharedTos
                .OrderByDescending(d => d.InsertedAt)
                .Take(5)
                .ToList();

            if (notificationSharedTos == null || notificationSharedTos.Count == 0)
            {
                return NotFound();
            }

            List<NotificationSharedToGetDTO> notificationSharedToGetDTO = mapper.Map<List<NotificationSharedToGetDTO>>(notificationSharedTos);

            foreach (var notificationSharedTo in notificationSharedToGetDTO)
            {
                string serverUrl = $"{Request.Scheme}://{Request.Host}/";
                if (!string.IsNullOrEmpty(notificationSharedTo.ImageLink))
                {
                    notificationSharedTo.ImageLink = $"{serverUrl}{notificationSharedTo.ImageLink.Replace("\\", "/")}";
                }
            }

            return Ok(notificationSharedToGetDTO);
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////
        
        [HttpGet("GetNotNotifiedYetByUserID")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> GetNotNotifiedYetByUserID()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            } 
            else if(userTypeClaim == "student")
            {
                userTypeID= 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            List<NotificationSharedTo> notificationSharedTos = await Unit_Of_Work.notificationSharedTo_Repository.Select_All_With_IncludesById<NotificationSharedTo>(
                    f => f.IsDeleted != true && f.Notification.IsDeleted != true && !f.NotifiedOrNot && f.UserID == userId && f.UserTypeID == userTypeID,
                    query => query.Include(d => d.Notification)
                    );

            if (notificationSharedTos == null || notificationSharedTos.Count == 0)
            {
                return NotFound();
            }

            List<NotificationSharedToGetDTO> notificationSharedToGetDTO = mapper.Map<List<NotificationSharedToGetDTO>>(notificationSharedTos);

            foreach (var notificationSharedTo in notificationSharedToGetDTO)
            {
                string serverUrl = $"{Request.Scheme}://{Request.Host}/";
                if (!string.IsNullOrEmpty(notificationSharedTo.ImageLink))
                {
                    notificationSharedTo.ImageLink = $"{serverUrl}{notificationSharedTo.ImageLink.Replace("\\", "/")}";
                }
            }

            foreach (var item in notificationSharedTos)
            {
                item.NotifiedOrNot = true;
                TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                item.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    item.UpdatedByOctaId = userId;
                    if (item.UpdatedByUserId != null)
                    {
                        item.UpdatedByUserId = null;
                    }
                }
                else if (userTypeClaim == "employee")
                {
                    item.UpdatedByUserId = userId;
                    if (item.UpdatedByOctaId != null)
                    {
                        item.UpdatedByOctaId = null;
                    }
                }
                Unit_Of_Work.notificationSharedTo_Repository.Update(item);
            }
            Unit_Of_Work.SaveChanges();

            return Ok(notificationSharedToGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

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
